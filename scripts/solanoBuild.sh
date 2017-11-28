#!/usr/bin/env bash
# Script to push to the Amazon ECR Docker registry. Adapted from Solano's example
# project: https://github.com/solanolabs/ci_memes-ecr/blob/master/scripts/solano-deploy.sh

PROJECT_NAME="pasonpower/webapp"
CLUSTER_NAME="battmanWebappStaging"

set -eo pipefail # Exit on error

COMMIT_HASH=$(git rev-parse HEAD)
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

IMAGE_NAME="${PROJECT_NAME}:${COMMIT_HASH}"

sudo npm install -gf yarn@^0.28.0

echo "registry=https://registry.npmjs.org/" > .npmrc
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
echo 'registry "https://registry.npmjs.org"' > .yarnrc

yarn --version
yarn --ignore-scripts
npm rebuild

# Install Docker Compose if it is not already installed
# if [ ! -f "/usr/local/bin/docker-compose" ]; then
#   sudo bash -c "curl -L https://github.com/docker/compose/releases/download/1.5.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose"
#   sudo chmod +x /usr/local/bin/docker-compose
# fi

# sudo docker-compose -f scripts/pason-webapp-dbs/docker-compose.yml up -d
# npm run db:migrate
# npm run db:dynamoMigrate
# npm run test:solano
# sudo docker-compose -f scripts/pason-webapp-dbs/docker-compose.yml down

npm run test:unit

npm run build:docker

# Install the latest AWS CLI. The pre-installed version doesn't have the ecr commands we need.
if [[ ! -f "${HOME}/bin/aws" ]]; then
  curl "https://s3.amazonaws.com/aws-cli/awscli-bundle.zip" -o "awscli-bundle.zip"
  unzip awscli-bundle.zip
  ./awscli-bundle/install -b $HOME/bin/aws # $HOME/bin is in $PATH
fi

# Set aws lib path
if [ -d "${HOME}/lib/python2.7/site-packages" ]; then
  export PYTHONPATH="${HOME}/lib/python2.7/site-packages"
fi

# Install jq if it is not already installed
if [[ ! -f "$HOME/bin/jq" ]]; then
  wget -O $HOME/bin/jq https://github.com/stedolan/jq/releases/download/jq-1.5/jq-linux64
  chmod +x $HOME/bin/jq # $HOME/bin is in $PATH
fi

FQ_COMMIT_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${IMAGE_NAME}"
BRANCH_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${PROJECT_NAME}:${BRANCH_NAME}"

sudo docker tag --force "$IMAGE_NAME" "$FQ_COMMIT_URI"
sudo docker tag --force "$IMAGE_NAME" "$BRANCH_URI"

LOGIN_TO_ECR=$($HOME/bin/aws ecr get-login --region "$AWS_DEFAULT_REGION")
sudo $LOGIN_TO_ECR

# Push image to Amazon ECR
sudo docker push "$FQ_COMMIT_URI"
sudo docker push "$BRANCH_URI"

# delete hyphens in stack name because we're using it in the DB name
STACK_NAME=${TDDIUM_CURRENT_BRANCH//[![:alnum:]]}
echo "\$TDDIUM_CURRENT_BRANCH = ${TDDIUM_CURRENT_BRANCH}"
echo "\$STACK_NAME = ${STACK_NAME}"
ROOT_URL_FOR_BATTSIM_BRANCH="http://${STACK_NAME}.pasonpowerint.com"
DYNAMO_TABLE_PREFIX_BRANCH="webapp-${STACK_NAME}-"

aws cloudformation deploy --stack-name ${STACK_NAME} \
                        --template-file /$HOME/src/repo/webapp/scripts/cloudformation.yml \
                        --parameter-overrides DBUser=pasonpower \
                                              GoogleMapsApiKey=${GOOGLE_MAPS_API_KEY_STAGING} \
                                              GenabilityAppId=${GENABILITY_APP_ID_STAGING} \
                                              GenabilityBaseUrl=${GENABILITY_BASE_URL_STAGING} \
                                              DynamoTablePrefix=${DYNAMO_TABLE_PREFIX_BRANCH} \
                                              BattsimBaseUrl=${BATTSIM_BASE_URL_STAGING} \
                                              GenabilityAppKey=${GENABILITY_APP_KEY_STAGING} \
                                              DBPassword=${DB_PASSWORD_STAGING} \
                                              RootUrlBattsim=${ROOT_URL_FOR_BATTSIM_BRANCH} \
                                              DockerImageName=${FQ_COMMIT_URI} \
                                              DeleteChannelReadThroughput=${DELETE_CHANNEL_READ_THROUGHPUT} \
                                              DeleteChannelWriteThroughput=${DELETE_CHANNEL_WRITE_THROUGHPUT} \
                        --capabilities CAPABILITY_IAM

