#!/bin/bash
set -e

DIRECTORY=$(dirname $0)

# Path in VMs
SHARE_DIR="/mnt/data/shared"
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
DATABASE_HOST=""
HF_TOKEN=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -h|--hostname) HOSTNAME="$2"; shift ;;
        -db|--db-name) DATABASE_NAME="$2"; shift ;;
        -du|--db-user) DATABASE_USER="$2"; shift ;;
        -dp|--db-pass) DATABASE_PASS="$2"; shift ;;
        -dh|--db-host) DATABASE_HOST="$2"; shift ;;
        -t|--hf-token) HF_TOKEN="$2"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

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

if [[ -z "$DATABASE_HOST" ]]; then
    echo "ERROR: database host not specified!, -dh|--db-host"
    exit 1
fi

echo "CLIENT HOSTNAME=$HOSTNAME"


DOCKER_VITE_BACKEND_URL="http://$HOSTNAME/backend/v1"
DOCKER_PREFECT_URL=http://$HOSTNAME:4201
DATABASE_URL="postgresql://$DATABASE_USER:$DATABASE_PASS@$HOSTNAME:5432/$DATABASE_NAME"
DOCKER_DATABASE_URL="postgresql://$DATABASE_USER:$DATABASE_PASS@$DATABASE_HOST:5432/$DATABASE_NAME"
LOCAL_IP_ADDRESS=$(hostname -I | awk '{print $1}')

# For prefect server
echo "SHARE_DIR=$SHARE_DIR" > $DIRECTORY/../pipeline/.env
echo "DATABASE_URL=$DATABASE_URL" >> $DIRECTORY/../pipeline/.env
echo "PREFECT_UI_URL=$PREFECT_UI_URL" >> $DIRECTORY/../pipeline/.env
echo "PREFECT_API_URL=$PREFECT_API_URL" >> $DIRECTORY/../pipeline/.env
echo "PREFECT_RUNNER_PROCESS_LIMIT=1" >> $DIRECTORY/../pipeline/.env
echo "HF_TOKEN=$HF_TOKEN" >> $DIRECTORY/../pipeline/.env
echo "HOST_IP=$LOCAL_IP_ADDRESS" >> $DIRECTORY/../pipeline/.env

### Docker with .env.compose or .env.staging
# For prefect server
echo "SHARE_DIR=$SHARE_DIR" > $DIRECTORY/../pipeline/.env.compose
echo "HF_TOKEN=$HF_TOKEN" >> $DIRECTORY/../pipeline/.env.compose
echo "PREFECT_API_URL=$DOCKER_PREFECT_URL/api" >> $DIRECTORY/../pipeline/.env.compose
echo "PREFECT_UI_URL=$DOCKER_PREFECT_URL" >> $DIRECTORY/../pipeline/.env.compose
echo "PREFECT_RUNNER_PROCESS_LIMIT=1" >> $DIRECTORY/../pipeline/.env.compose
echo "DATABASE_URL=$DOCKER_DATABASE_URL" >> $DIRECTORY/../pipeline/.env.compose
echo "HOST_IP=$LOCAL_IP_ADDRESS" >> $DIRECTORY/../pipeline/.env.compose

# For backend
echo "DATABASE_URL=$DATABASE_URL" > $DIRECTORY/../backend/.env
echo "SHARE_DIR=$SHARE_DIR" >> $DIRECTORY/../backend/.env
echo "PREFECT_API_URL=$PREFECT_API_URL" >> $DIRECTORY/../backend/.env

# For backend with .env.compose
echo "DATABASE_URL=$DOCKER_DATABASE_URL" > $DIRECTORY/../backend/.env.compose
echo "SHARE_DIR=$SHARE_DIR" >> $DIRECTORY/../backend/.env.compose
echo "PREFECT_API_URL=$DOCKER_PREFECT_URL/api" >> $DIRECTORY/../backend/.env.compose


# For frontend
echo "VITE_BACKEND_URL=$VITE_BACKEND_URL" > $DIRECTORY/../frontend/.env
echo "VITE_PREFECT_UI_URL=$DOCKER_PREFECT_URL" >> $DIRECTORY/../frontend/.env
echo "VITE_FRONTEND_URL=http://localhost:3000" >> $DIRECTORY/../frontend/.env

# For frontend with .env.staging
echo "VITE_BACKEND_URL=$DOCKER_VITE_BACKEND_URL" > $DIRECTORY/../frontend/.env.staging
echo "VITE_PREFECT_UI_URL=$DOCKER_PREFECT_URL" >> $DIRECTORY/../frontend/.env.staging
echo "VITE_FRONTEND_URL=http://$HOSTNAME" >> $DIRECTORY/../frontend/.env.staging


echo "Finished setting up local environment variables."