// @flow

import {validateNetworkSettingsForHandler} from '../../universal/network-settings/NetworkSettingsCommon'
import type {NetworkSettings} from '../../universal/network-settings/NetworkSettingsCommon'
import type {NetworkSettingsHandler} from './NetworkSettingsHandler'

const baseNetworkSettings = {
  ipAddress: '192.168.1.220',
  netmask: '255.255.255.0',
  gateway: '192.168.1.1',
  dnsServers: '192.168.1.1'
}

const STATIC_SETTINGS: NetworkSettings = {
  ...baseNetworkSettings,
  dhcpEnabled: false
}

const DHCP_SETTINGS: NetworkSettings = {
  ...baseNetworkSettings,
  dhcpEnabled: true
}

function settingsForMode(mode: string): NetworkSettings {
  switch (mode) {
  case 'static': return STATIC_SETTINGS
  case 'dhcp': return DHCP_SETTINGS
  default: throw new Error(`unrecognized value for mode: ${mode}, expected 'static' or 'dhcp'`)
  }
}

export default class TestNetworkSettingsHandler implements NetworkSettingsHandler {
  _settings: NetworkSettings = STATIC_SETTINGS

  setMode(mode: 'static' | 'dhcp') {
    this.setNetworkSettings(settingsForMode(mode))
  }

  async getNetworkSettings(): Promise<NetworkSettings> {
    return this._settings
  }

  async getNetworkState(): Promise<NetworkSettings> {
    if (this._settings.dhcpEnabled) return DHCP_SETTINGS
    return this._settings
  }

  async setNetworkSettings(settings: NetworkSettings): Promise<void> {
    const errors = validateNetworkSettingsForHandler(settings)
    if (errors.length) throw new Error(`Network settings are invalid:\n${errors.join('\n')}`)
    this._settings = settings
  }
}

