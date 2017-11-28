#!/usr/bin/env bash
# Important!! Run this script from the project root, e.g. `scripts/sync.sh`
rsync -av --delete --exclude-from .gitignore --exclude .git . infratester:/home/ubuntu/webapp