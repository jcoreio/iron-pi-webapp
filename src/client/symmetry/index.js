// @flow

import SymmetryClient from './SymmetryClient'
import { SYMMETRY_BROWSER_PATH } from '../../universal/symmetry/constants'
import { toWebSocketURL } from '../../universal/util/urlUtil'

let _client: ?SymmetryClient

/**
 * Set up connection manager with control over the URL. Useful for testing.
 * @param opts
 * @returns {SymmetryClient}
 */
export function setupSymmetryClient(opts: {url?: string, createWebSocket?: Function} = {}): SymmetryClient {
  const url = toWebSocketURL(opts.url || document.URL, SYMMETRY_BROWSER_PATH)
  const createWebSocket = opts.createWebSocket || ((...args) => new WebSocket(...args))
  const mgr = _client = new SymmetryClient(createWebSocket(url), {autoReconnect: true, useHeartbeat: true})
  return mgr
}

function client(): SymmetryClient {
  return _client || (_client = setupSymmetryClient())
}

export default {
  call,
  client,
}

export async function call(method: string, ...args: Array<any>): Promise<any> {
  const cli = client()
  return await cli.call(method, ...args)
}

