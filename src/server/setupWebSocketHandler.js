// @flow

import WebSocket from 'faye-websocket'

import {SYMMETRY_BROWSER_PATH} from '../universal/symmetry/constants'
import SymmetryServer from './symmetry/SymmetryServer'

const urlRegExp = new RegExp('^' + SYMMETRY_BROWSER_PATH + '([/].+|[/]?)$')

export default function setupWebSocketHandler(httpServer: Object) {
  httpServer.on('upgrade', (request: Object, socket: Object, body: any): ?boolean => {
    if (request.url.match(urlRegExp)) {
      if (WebSocket.isWebSocket(request)) {
        const symmetry = new SymmetryServer({socket: new WebSocket(request, socket, body)})
        httpServer.on('close', () => symmetry.close())
      }
      return true
    }
  })
}
