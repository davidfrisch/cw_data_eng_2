#!/bin/bash

set -e

DIRECTORY=$(dirname $0)


# Call Home
cd /mnt/data/shared/new_audios/ && sudo wget -r -np -nd -A wav --no-check-certificate https://media.talkbank.org/ca/CallHome/eng/0wav/ 

# CAll Friend
cd /mnt/data/shared/new_audios/ && sudo wget -r -np -nd -A wav --no-check-certificate https://media.talkbank.org/ca/CallFriend/eng-n/0wav/