#!/bin/bash

set -e
DIRECTORY=$(dirname $0)

SECRET_KEY_FILE=""
GIT_TOKEN=""
HF_TOKEN=""
PG_USER=""
PG_PASSWORD=""
PLATFORM_URL=""
CLIENT_IP_ADDRESS=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -du|--db-user) DATABASE_USER="$2"; shift ;;
        -dp|--db-pass) DATABASE_PASS="$2"; shift ;;
        -hf|--hf-token) HF_TOKEN="$2"; shift ;;
        -p|--platform-url) PLATFORM_URL="$2"; shift ;;
        -c|--client-ip-address) CLIENT_IP_ADDRESS="$2"; shift ;;
        -s|--secret-key-file) SECRET_KEY_FILE="$2"; shift ;;
        -t|--git-token) GIT_TOKEN="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done


if [[ -z "$SECRET_KEY_FILE" ]]; then
    echo "ERROR: secret key file not specified!, -s|--secret-key-file"
    exit 1
fi

if [[ ! -f "$SECRET_KEY_FILE" ]]; then
    echo "ERROR: secret key file does not exist!"
    exit 1
fi

if [[ -z "$GIT_TOKEN" ]]; then
    echo "ERROR: git token not specified!, -t|--git-token"
    exit 1
fi

if [[ -z "$HF_TOKEN" ]]; then
    echo "ERROR: huggingface token not specified!, -hf|--hf-token"
    exit 1
fi

if [[ -z "$DATABASE_USER" ]]; then
    echo "ERROR: database user not specified!, -du|--db-user"
    exit 1
fi

if [[ -z "$DATABASE_PASS" ]]; then
    echo "ERROR: database password not specified!, -dp|--db-pass"
    exit 1
fi

if [[ -z "$PLATFORM_URL" ]]; then
    echo "ERROR: platform url not specified!, -p|--platform-url"
    exit 1
fi

# if PLATFORM_URL has http:// or https://, remove it
PLATFORM_URL=$(echo $PLATFORM_URL | sed 's/https\?:\/\///')


python3_version=$(python3 -V 2>&1 | grep -Po '(?<=Python )(.+)')

if [[ $python3_version != 3.9* ]]; then
    echo "ERROR: this script requires Python3.9!"
    exit 1
fi

if ! which pip3 >& /dev/null; then
    echo "ERROR: pip3 is not installed."
    echo "       On Ubuntu, run:"
    echo "       curl -sS https://bootstrap.pypa.io/get-pip.py | sudo python3.9"
    echo "       and try running this script again."
    exit 1
fi


echo "
ssh_private_key: $SECRET_KEY_FILE
git_token: $GIT_TOKEN
user: ec2-user
group: ec2-user
hf_token: $HF_TOKEN
pg_user: $DATABASE_USER
pg_password: $DATABASE_PASS
platform_url: $PLATFORM_URL
client_ip_address: $CLIENT_IP_ADDRESS
" > $DIRECTORY/../ansible/custom_vars.yml


# Software installation
python3 -m ensurepip --upgrade
python3 -m pip install --upgrade pip
pip3 install ansible
pip3 install python-dotenv
pip3 install requests


sudo chown -R ec2-user:ec2-user /etc/ansible
echo "[defaults]
private_key_file = $SECRET_KEY_FILE"> /etc/ansible/ansible.cfg


eval "$(ssh-agent -s)"
chmod 600 $SECRET_KEY_FILE
ssh-add $SECRET_KEY_FILE

# take the next line of [client] from the inventory file
ansible-playbook -i $DIRECTORY/../ansible/inventory.ini $DIRECTORY/../ansible/ping_all.yml

echo "Finished installing host dependencies."
echo "You can now run the following command to start the installation of the Cloud environment (suggest to use tmux):"
