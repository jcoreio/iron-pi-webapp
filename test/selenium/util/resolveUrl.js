// @flow

import requireEnv from '@jcoreio/require-env'

export default function resolveUrl(url: string): string {
  if (url[0] === '/') return requireEnv('ROOT_URL').replace(/localhost|127.0.0.1|0.0.0.0/, '192.168.65.1') + url
  return url
}
