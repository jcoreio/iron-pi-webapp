// @flow

import requireEnv from '@jcoreio/require-env'

function resolveUrl(url: string): string {
  if (url[0] === '/') return requireEnv('ROOT_URL') + url
  return url
}

module.exports = resolveUrl
