// @flow

import {exec} from 'promisify-child-process'

let hostIP

export default async function getHostIP(): Promise<?string> {
  if (hostIP) return hostIP
  const {stdout} = await exec('docker run --rm node:8 node -e \'require("dns").lookup("docker.for.mac.localhost", (err, host) => console.log(host))\'', {
    encoding: 'utf8'
  })
  return hostIP = stdout && stdout.toString().trim()
}

