#!/bin/bash

set -e

DIRECTORY=$(dirname $0)

docker stack deploy --compose-file docker-compose.yml data_eng

