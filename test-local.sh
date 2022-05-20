#!/usr/bin/env bash

### Run the github action locally using act and docker
### For running a specific job you can use `-j <job>`.
### Example: `./test-local.sh -j test`

### As of now you also need to run localstack with
### docker run --rm -it -p 4566:4566 -e SERVICES=secretsmanager localstack/localstack
### Wait for act to support services (https://github.com/nektos/act/pull/775)

set -e

if ! command -v act > /dev/null 2>&1
then
    echo "act needs to be installed. Please visit https://github.com/nektos/act"
    exit
fi


docker build -t act-with-awscli - <<EOF
FROM node:16-buster-slim

RUN apt-get update && \
    apt -y install curl unzip groff less && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install
EOF



act -P ubuntu-latest=act-with-awscli "${@}"