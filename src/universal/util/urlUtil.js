// @flow

import parseURL from 'url-parse'

export function toWebSocketURL(hostURL: string, servicePath: string): string {
  const { protocol, host } = parseURL(hostURL)
  let wsProtocol = 'https:' === protocol || 'wss:' === protocol ? 'wss:' : 'ws:'
  return `${wsProtocol}//${host}${servicePath}`
}
