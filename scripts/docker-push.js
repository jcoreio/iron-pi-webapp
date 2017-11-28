#!/usr/bin/env babel-node
// @flow

import asyncScript from 'crater-util/lib/asyncScript'
import execAsync from 'crater-util/lib/execAsync'
import spawnAsync from 'crater-util/lib/spawnAsync'
import path from 'path'

const AWS_ACCOUNT_ID = '976401372843'
const AWS_DEFAULT_REGION = 'us-west-2'

const root = path.resolve(__dirname, '..')

process.on('SIGINT', (): any => process.exit(1))

asyncScript(async (): Promise<void> => {
  const opts = {cwd: root}
  // Log in to the ECR
  await execAsync(`$(aws ecr get-login  --region ${AWS_DEFAULT_REGION})`)
  const commitHash = (await execAsync('git rev-parse HEAD', {silent: true})).stdout.trim()
  const {TARGET} = process.env
  const tag = `pasonpower/webapp${TARGET ? '-' + TARGET : ''}:${commitHash}`
  const repoURI = `${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${tag}`
  await spawnAsync('docker', ['tag', tag, repoURI], opts)
  await spawnAsync('docker', ['push', repoURI], opts)
})


