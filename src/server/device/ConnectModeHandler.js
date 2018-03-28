// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'

import {NETWORK_MODE_STATIC, NETWORK_MODE_DHCP} from '../../universal/network-settings/NetworkSettingsCommon'

export const IN_CONNECT_MODE_CHANGED = 'inConnectModeChanged'
export const EVENT_CONNECT_BUTTON_PRESSED = 'connectButtonPressed'
export const EVENT_NETWORK_MODE_COMMAND = 'networkModeCommand'

const CONNECT_MODE_TIMEOUT = 1000 * 60 * 5

type Events = {
  inConnectModeChanged: [boolean],
  connectButtonPressed: [],
  networkModeCommand: ['static' | 'dhcp'],
}

export default class ConnectModeHandler extends EventEmitter<Events> {
  _inConnectMode: boolean = false
  _prevCount: ?number

  _buttonHoldBegin: ?number
  _triggeredNetworkingMode: ?string

  setConnectButtonState({connectButtonLevel, connectButtonEventCount}: {connectButtonLevel: ?boolean, connectButtonEventCount: ?number}) {
    // Very short button presses may be missed by monitoring connectButtonLevel, but you can
    // catch them by watching connectButtonEventCount
    if (connectButtonEventCount != null) {
      if (this._prevCount != null && connectButtonEventCount !== this._prevCount)
        this._handleButtonPressed()
      this._prevCount = connectButtonEventCount
    }
    if (connectButtonLevel != null) {
      if (connectButtonLevel) {
        // button is being held down
        const buttonHoldBegin = this._buttonHoldBegin
        if (!buttonHoldBegin) {
          this._handleButtonPressed()
          this._buttonHoldBegin = Date.now()
        } else {
          // see how long the button has been held down
          const buttonHoldTime = Date.now() - buttonHoldBegin
          let triggeredNetworkingMode = undefined
          if (buttonHoldTime > 20 * 1000)
            triggeredNetworkingMode = NETWORK_MODE_DHCP
          else if (buttonHoldTime > 10 * 1000)
            triggeredNetworkingMode = NETWORK_MODE_STATIC
          if (triggeredNetworkingMode && triggeredNetworkingMode !== this._triggeredNetworkingMode) {
            this.emit(EVENT_NETWORK_MODE_COMMAND, triggeredNetworkingMode)
          }
          this._triggeredNetworkingMode = triggeredNetworkingMode
        }
      } else {
        this._buttonHoldBegin = undefined
        this._triggeredNetworkingMode = undefined
      }
    }
  }

  _lastButtonPressTime: ?number;
  _connectModeTimeout: ?number

  _handleButtonPressed() {
    const now = Date.now()
    if (!this._lastButtonPressTime || now - this._lastButtonPressTime > 1000) {
      this._lastButtonPressTime = now
      this.emit(EVENT_CONNECT_BUTTON_PRESSED)
      this.inConnectMode = true
      if (this._connectModeTimeout) {
        clearTimeout(this._connectModeTimeout)
      }
      this._connectModeTimeout = setTimeout(() => this._connectModeTimeoutExpired(), CONNECT_MODE_TIMEOUT)
    }
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

