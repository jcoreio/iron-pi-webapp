// @flow

import requireEnv from '@jcoreio/require-env'

function resolveUrl(url: string): string {
  const hostIPAddress = process.env.HOST_IP_ADDRESS || '192.168.65.1'
  if (url[0] === '/') return requireEnv('ROOT_URL').replace(/localhost|127.0.0.1|0.0.0.0/, hostIPAddress) + url
  return url
}

module.exports = resolveUrl
