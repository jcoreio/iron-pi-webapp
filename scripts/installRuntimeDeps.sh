#!/usr/bin/env bash
set -ex
yarn --ignore-scripts --production
cd node_modules/bcrypt
yarn --production
