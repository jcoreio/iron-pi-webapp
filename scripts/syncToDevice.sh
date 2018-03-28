#!/usr/bin/env bash
rsync -r --exclude build --exclude node_modules --exclude .env * pi:/service/iron-pi-webapp
