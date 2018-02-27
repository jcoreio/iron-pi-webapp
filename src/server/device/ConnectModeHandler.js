// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'

export const IN_CONNECT_MODE_CHANGED = 'inConnectModeChanged'

type Events = {
  inConnectModeChanged: [boolean],
}

export default class ConnectModeHandler extends EventEmitter<Events> {
  _inConnectMode: boolean = false

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

