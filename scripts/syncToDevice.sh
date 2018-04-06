#!/usr/bin/env bash
rsync -r --delete --exclude node_modules --exclude .env * pi:/service/iron-pi-webapp
