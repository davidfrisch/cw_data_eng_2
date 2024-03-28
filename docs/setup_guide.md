# Project Setup Guide

## Git Clone

Clone the repository to the Host VM:

```bash
git clone https://github.com/davidfrisch/cw_data_eng_2.git
cd cw_data_eng_2
```

## SSH Configuration

Ensure that the public key is added to the 'authorized_keys' file on each VM, corresponding to the private key intended for ssh connection.


## Inventory Configuration

Create an inventory file (`./ansible/inventory.ini`) with your cluster information by editing the following template and running the command:

```bash
echo "\
[client]
<client_ip>

[clusters]
<cluster1_ip>
<cluster2_ip>
<cluster.._ip>
<clusterN_ip>
"\
>./ansible/inventory.ini
```

## Host Setup

Run the following commands to set up the hosts:

```bash
./scripts/host_setup_script.sh \
	-t <git_token> \
	-hf <huggingface_token> \
	-s ~/.ssh/david_student_key \
	-c <client_ip> \
	-p <client_url>.compute.amazonaws.com \
	-du postgres \
	-dp postgres 
```

If it fails because the ansible ping fails, fix the issue and run the script again.

This script creates the file `ansible/custom_vars.yml`, install ansible and test the connection to the VMs.

## Dependencies Installation

Install dependencies with:

```bash
sudo dnf install tmux
```

## Ansible Playbook Execution

Start a new `tmux` session:

```bash
tmux
```

Run the Ansible playbook:

```bash
./scripts/setup_ansible_script.sh
```

### Note

⚠️ It will take approximately XX minutes to complete the setup.

💡 Monitor the progress of the Ansible script using:

```bash
tmux attach-session -t <session-id>
```

Now, your environment should be set up and ready for use.
