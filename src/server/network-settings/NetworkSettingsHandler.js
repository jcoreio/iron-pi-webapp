// @flow

import {exec} from 'child_process'
import {readFile, writeFile} from 'fs'

import promisify from 'es6-promisify'
import logger from 'log4jcore'

const log = logger('NetworkSettingsHandler')

import {validateNetworkSettings} from '../../universal/network-settings/NetworkSettingsCommon'
import type {NetworkSettings} from '../../universal/network-settings/NetworkSettingsCommon'

const INTERFACES_FILE = '/etc/network/interfaces'

const ADDRESS = 'address'
const NETMASK = 'netmask'
const GATEWAY = 'gateway'
const DNS_SERVERS = 'dns-nameservers'

const AUTO_LINE = 'auto eth0'
const DHCP_LINE = 'iface eth0 inet dhcp'
const STATIC_LINE = 'iface eth0 inet static'

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

const isCommented = val => val.startsWith('#')
const lineContent = val => (isCommented(val) ? val.substr(1) : val).trim()

export default class NetworkSettingsHandler {
  _setModeInProgress: ?string;
  _setModeNext: ?string;

  setMode(mode: 'static' | 'dhcp') {
    const applyNetworkSettings = (settings: NetworkSettings) => {
      this.setNetworkSettings(settings)
        .then(() => {
          const nextModeName = this._setModeNext
          this._setModeNext = undefined
          if (nextModeName) {
            applyNetworkSettings(settingsForMode(nextModeName))
          } else {
            this._setModeInProgress = undefined
          }
        })
        .catch((err: Error) => {
          this._setModeInProgress = undefined
          this._setModeNext = undefined
          log.error(`could not set network mode to ${mode}: ${err.stack || (err: any)}`)
        })
    }
    const settings = settingsForMode(mode)
    if (this._setModeInProgress) {
      if (this._setModeInProgress !== mode)
        this._setModeNext = mode
      return
    }
    applyNetworkSettings(settings)
  }

  async getNetworkSettings(): Promise<NetworkSettings> {
    const lines = await this._readNetworkSettingsFile()
    const networkSettingsLoc = locateNetworkSettings(lines)
    const ethLines = lines.slice(...networkSettingsLoc)

    let dhcpEnabled = true
    const fieldValues: Map<string, string> = new Map()
    ethLines.forEach((line: string) => {
      const commented = isCommented(line)
      const content = lineContent(line)
      if (STATIC_LINE === content) {
        dhcpEnabled = commented
      } else if (line[0] === ' ' || line[0] === '\t') {
        const firstSpace = content.indexOf(' ')
        if (firstSpace > 0) {
          const key = content.substring(0, firstSpace).trim()
          const value = content.substring(firstSpace + 1).trim()
          fieldValues.set(key, value)
        }
      }
    })

    const fieldValue = field => fieldValues.get(field) || ''
    return {
      dhcpEnabled,
      ipAddress: fieldValue(ADDRESS),
      netmask: fieldValue(NETMASK),
      gateway: fieldValue(GATEWAY),
      dnsServers: fieldValue(DNS_SERVERS)
    }
  }

  async setNetworkSettings(settings: NetworkSettings): Promise<void> {
    const errors = validateNetworkSettings(settings)
    if (errors.length) throw new Error(`Network settings are invalid:\n${errors.join('\n')}`)
    await this._writeNetworkSettings(settings)
    await this._restartNetworking()
  }

  async _writeNetworkSettings(settings: NetworkSettings): Promise<void> {
    const linesIn: Array<string> = await this._readNetworkSettingsFile()
    let networkSettingsLoc = [ linesIn.length, linesIn.length ]
    try {
      networkSettingsLoc = locateNetworkSettings(linesIn)
    } catch (err) {
      log.info('could not locate network settings. appending...')
    }
    const maybeCommented = (line, comm) => comm ? `#${line}` : line
    const maybeConfigLine = (key: string, value: ?string, commented: boolean = false) => {
      let returnValue = value ? `  ${key} ${value}` : undefined
      if (returnValue && commented)
        returnValue = `#${returnValue}`
      return returnValue
    }
    const linesBefore = linesIn.slice(0, networkSettingsLoc[0])
    let linesAfter = linesIn.slice(networkSettingsLoc[1])
    // Ensure there's a blank line after the Ethernet section
    if (!linesAfter.length || linesAfter[0].trim() !== '')
      linesAfter = [ '', ...linesAfter ]

    const configLines = [
      AUTO_LINE,
      maybeCommented(DHCP_LINE, !settings.dhcpEnabled),
      maybeCommented(STATIC_LINE, settings.dhcpEnabled),
      maybeConfigLine(ADDRESS, settings.ipAddress, settings.dhcpEnabled),
      maybeConfigLine(NETMASK, settings.netmask, settings.dhcpEnabled),
      maybeConfigLine(GATEWAY, settings.gateway, settings.dhcpEnabled),
      maybeConfigLine(DNS_SERVERS, settings.dnsServers, settings.dhcpEnabled)
    ].filter(line => line !== undefined)

    const lines = [
      ...linesBefore,
      ...configLines,
      ...linesAfter
    ]

    await promisify(writeFile)(INTERFACES_FILE, lines.join('\n'))
  }

  async _readNetworkSettingsFile(): Promise<Array<string>> {
    const strFile = await promisify(readFile)(INTERFACES_FILE, 'utf8')
    return strFile.split('\n')
  }

  async _restartNetworking(): Promise<void> {
    log.info('restarting eth0...')
    await promisify(exec)('ifdown eth0 && ifup eth0')
  }
}

function locateNetworkSettings(lines: Array<string>): Array<number> {
  const begin = lines.findIndex(line => line.startsWith(AUTO_LINE))
  if (begin < 0) throw new Error('could not find ethernet section')
  const nextWhitespaceOffset = lines.slice(begin).findIndex(line => !line.trim().length)
  const end = nextWhitespaceOffset < 0 ? lines.length : begin + nextWhitespaceOffset
  return [ begin, end ]
}
