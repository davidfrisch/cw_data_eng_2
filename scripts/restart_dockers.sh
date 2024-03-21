#!/bin/bash

set -e

DIRECTORY=$(dirname $0)

ansible-playbook -i $DIRECTORY/../ansible/inventory.ini $DIRECTORY/../ansible/stop_all.yml
ansible-playbook -i $DIRECTORY/../ansible/inventory.ini $DIRECTORY/../ansible/start_all.yml