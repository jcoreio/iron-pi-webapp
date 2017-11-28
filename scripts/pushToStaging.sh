#!/usr/bin/env bash

git branch -f staging $(git rev-parse HEAD)
git push -f origin staging
