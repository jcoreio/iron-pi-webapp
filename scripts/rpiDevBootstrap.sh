#!/usr/bin/env bash

# Installs dependencies necessary for an Iron Pi or Raspberry Pi to run a build

set -euxo pipefail
NODE_VERSION=10.16.0

export DEBIAN_FRONTEND=noninteractive

# Add apt-get sources for yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

sudo apt-get update

echo "installing node.js..."
NODE_FULL_VERSION=node-v${NODE_VERSION}-linux-armv7l
TAR_FILE=${NODE_FULL_VERSION}.tar.xz
wget https://nodejs.org/dist/v${NODE_VERSION}/${TAR_FILE}
tar xf ${TAR_FILE}
rm ${TAR_FILE}
cd ${NODE_FULL_VERSION}
sudo cp -R bin include lib share /usr/local
cd ..
rm -rf ${NODE_FULL_VERSION}

echo "installing yarn..."
sudo apt-get install -y --no-install-recommends yarn

sudo apt-get install -y git
