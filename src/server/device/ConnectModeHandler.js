// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'

export const IN_CONNECT_MODE_CHANGED = 'inConnectModeChanged'

const CONNECT_MODE_TIMEOUT = 1000 * 60 * 5

type Events = {
  inConnectModeChanged: [boolean],
}

export default class ConnectModeHandler extends EventEmitter<Events> {
  _inConnectMode: boolean = false
  _prevCount: ?number

  _connectModeTimeout: ?number

  setConnectButtonEventCount(count: number) {
    if (this._prevCount != null && count !== this._prevCount) {
      // Button was pressed
      this.inConnectMode = true
      if (this._connectModeTimeout) {
        clearTimeout(this._connectModeTimeout)
      }
      this._connectModeTimeout = setTimeout(() => this._connectModeTimeoutExpired(), CONNECT_MODE_TIMEOUT)
    }
    this._prevCount = count
  }

  _connectModeTimeoutExpired() {
    this._connectModeTimeout = undefined
    this.inConnectMode = false
  }

  get inConnectMode(): boolean {
    return this._inConnectMode
  }

  set inConnectMode(inConnectMode: boolean) {
    if (this._inConnectMode !== inConnectMode) {
      this._inConnectMode = inConnectMode
      this.emit(IN_CONNECT_MODE_CHANGED, inConnectMode)
    }
  }
}

