#!/bin/bash
set -e

DIRECTORY=$(dirname $0)

# Path in VMs
SHARE_DIR="/mnt/beegfs/prefect_data/pipelines_audios"
# DOCKER_SHARE_DIR="/data"

# For local
PREFECT_UI_URL="http://localhost:4200"
PREFECT_API_URL=$PREFECT_UI_URL+"/api"
VITE_BACKEND_URL="http://localhost:3001"

# USER SPECIFIC VARIABLES
HOSTNAME=""
DATABASE_NAME=audio_results
DATABASE_USER=""
DATABASE_PASS=""
HF_TOKEN=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -h|--hostname) HOSTNAME="$2"; shift ;;
        -ip|--ip-address) IP_ADDRESS="$2"; shift ;;
        -db|--db-name) DATABASE_NAME="$2"; shift ;;
        -du|--db-user) DATABASE_USER="$2"; shift ;;
        -dp|--db-pass) DATABASE_PASS="$2"; shift ;;
        -t|--hf-token) HF_TOKEN="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

if [[ -z "$HOSTNAME" ]] && [[ -n "$IP_ADDRESS" ]]; then
    HOSTNAME=$IP_ADDRESS
fi

if [[ -z "$HOSTNAME" ]]; then
    echo "ERROR: hostname not specified!, use -h or --hostname"
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

echo "CLIENT HOSTNAME=$HOSTNAME"
if [[ -z "$IP_ADDRESS" ]]; then
    IP_ADDRESS=$(nslookup "$HOSTNAME" | awk '/^Address: / { print $2 }')
fi


if [[ -z "$IP_ADDRESS" ]]; then
    echo "ERROR: IP address not found in DNS!"
    exit 1
fi

DOCKER_VITE_BACKEND_URL="http://backend:3001/v1"
DOCKER_DATABASE_URL="postgresql://$DATABASE_USER:$DATABASE_PASS@postgres:5432/$DATABASE_NAME"
DOCKER_PREFECT_URL=http://prefect:4200
DATABASE_URL="postgresql://$DATABASE_USER:$DATABASE_PASS@postgres:5432/$DATABASE_NAME"
PREFECT_DATABASE_URL="postgresql+asyncpg://$DATABASE_USER:$DATABASE_PASS@postgres:5432/prefect"

# For pipeline
echo "SHARE_DIR=$SHARE_DIR" > $DIRECTORY/../pipeline/.env
echo "DATABASE_URL=$DATABASE_URL" >> $DIRECTORY/../pipeline/.env
echo "PREFECT_UI_URL=$PREFECT_UI_URL" >> $DIRECTORY/../pipeline/.env
echo "PREFECT_API_URL=$PREFECT_API_URL" >> $DIRECTORY/../pipeline/.env
echo "PREFECT_RUNNER_PROCESS_LIMIT=1" >> $DIRECTORY/../pipeline/.env
echo "HF_TOKEN=$HF_TOKEN" >> $DIRECTORY/../pipeline/.env

### Docker with .env.compose or .env.staging
# For pipeline
echo "SHARE_DIR=$SHARE_DIR" > $DIRECTORY/../.env.compose
echo "HF_TOKEN=$HF_TOKEN" >> $DIRECTORY/../.env.compose
echo "PREFECT_API_URL=$DOCKER_PREFECT_URL/api" >> $DIRECTORY/../.env.compose
echo "PREFECT_UI_URL=$DOCKER_PREFECT_URL" >> $DIRECTORY/../.env.compose
echo "PREFECT_API_DATABASE_CONNECTION_URL=$PREFECT_DATABASE_URL" >> $DIRECTORY/../.env.compose
echo "PREFECT_RUNNER_PROCESS_LIMIT=1" >> $DIRECTORY/../.env.compose
echo "DATABASE_URL=$DOCKER_DATABASE_URL" >> $DIRECTORY/../.env.compose
echo "Finished setting up local environment variables."

# For backend
echo "DATABASE_URL=$DATABASE_URL" > $DIRECTORY/../backend/.env
echo "SHARE_DIR=$SHARE_DIR" >> $DIRECTORY/../backend/.env

# For backend with .env.compose
echo "DATABASE_URL=$DOCKER_DATABASE_URL" > $DIRECTORY/../backend/.env.compose
echo "SHARE_DIR=$SHARE_DIR" >> $DIRECTORY/../backend/.env.compose


# For frontend
echo "VITE_BACKEND_URL=$VITE_BACKEND_URL" > $DIRECTORY/../frontend/.env
echo "VITE_PREFECT_UI_URL=$DOCKER_PREFECT_URL" >> $DIRECTORY/../frontend/.env
echo "VITE_FRONTEND_URL=http://localhost:3000" >> $DIRECTORY/../frontend/.env

# For frontend with .env.staging
echo "VITE_BACKEND_URL=$DOCKER_VITE_BACKEND_URL" > $DIRECTORY/../frontend/.env.staging
echo "VITE_PREFECT_UI_URL=$DOCKER_PREFECT_URL" >> $DIRECTORY/../frontend/.env.staging
echo "VITE_FRONTEND_URL=http://$HOSTNAME" >> $DIRECTORY/../frontend/.env.staging


