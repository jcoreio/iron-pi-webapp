// @flow

import assert from 'assert'
import child_process from 'child_process'
import fs from 'fs'

import promisify from 'es6-promisify'
import logger from 'log4jcore'

import {validateNetworkSettingsForHandler} from '../../universal/network-settings/NetworkSettingsCommon'
import type {NetworkSettings} from '../../universal/network-settings/NetworkSettingsCommon'

const log = logger('NetworkSettingsHandler')

const exec = promisify(child_process.exec)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

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

  /**
   * @returns {Promise<NetworkSettings>} Configured network settings, including DHCP
   * enabled, and IP address / netmask / DNS server info that is used in static IP
   * address mode. This method returns the settings stored in /etc/network/interfaces,
   * while getNetworkState() returns the results of `ifconfig` and similar commands.
   */
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
    const errors = validateNetworkSettingsForHandler(settings)
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

    await writeFile(INTERFACES_FILE, lines.join('\n'))
  }

  async _readNetworkSettingsFile(): Promise<Array<string>> {
    const strFile = await readFile(INTERFACES_FILE, 'utf8')
    return strFile.split('\n')
  }

  async _restartNetworking(): Promise<void> {
    log.info('restarting eth0...')
    await exec('ifdown eth0 && ifup eth0')
  }

  /**
   * @returns {Promise<NetworkSettings>} Current network state, including IP address,
   * netmask, and DNS server addresses. If the unit is in DHCP mode, this allows the
   * UI to fetch the current network settings assigned by the DHCP server. If the unit
   * is in static IP address mode, this function will still fetch the current network settings,
   * which should match the ones returned by getNetworkSettings().
   */
  async getNetworkState(): Promise<NetworkSettings> {
    // Reading /etc/network/interfaces seems to be the best way to determine if
    // DHCP is enabled.
    const {dhcpEnabled} = await this.getNetworkSettings()
    let ipAddress = ''
    let netmask = ''
    try {
      const result = parseIfconfig(await exec('ifconfig'))
      ipAddress = result.ipAddress
      netmask = result.netmask
    } catch (err) {
      log.error(`could not fetch IP address: ${err.stack}`)
    }

    let gateway = ''
    try {
      gateway = parseGateway(await exec('ip route'))
    } catch (err) {
      log.error(`could not fetch gateway: ${err.stack}`)
    }

    let dnsServers = ''
    try {
      dnsServers = parseDNSServers(await readFile('/etc/resolv.conf', 'utf8'))
    } catch (err) {
      log.error(`could not fetch DNS servers: ${err.stack}`)
    }

    return {dhcpEnabled, ipAddress, netmask, gateway, dnsServers}
  }
}

function locateNetworkSettings(lines: Array<string>): Array<number> {
  const begin = lines.findIndex(line => line.startsWith(AUTO_LINE))
  if (begin < 0) throw new Error('could not find ethernet section')
  const nextWhitespaceOffset = lines.slice(begin).findIndex(line => !line.trim().length)
  const end = nextWhitespaceOffset < 0 ? lines.length : begin + nextWhitespaceOffset
  return [ begin, end ]
}

function parseIfconfig(result: string): {ipAddress: string, netmask: string} {
  const lines = result.split('\n')
  const eth0LineIndex = lines.findIndex(line => line.startsWith('eth0'))
  assert(eth0LineIndex >= 0, 'line beginning with "eth0" not found')
  const addrLine = lines[eth0LineIndex + 1] // the `inet <ip address> line is immediately after the eth0: line
  assert(addrLine, 'ip address line is missing')
  const addrLineParts = addrLine.trim().split(' ').filter(part => !!part)
  assert('inet' === addrLineParts[0] && 'netmask' === addrLineParts[2], 'unexpected inet line content:' + JSON.stringify(addrLineParts))
  const ipAddress = addrLineParts[1]
  const netmask = addrLineParts[3]
  assert(ipAddress, 'ip address value is missing')
  assert(netmask, 'netmask value is missing')
  return {ipAddress, netmask}
}

function parseGateway(result: string): string {
  const lines = result.split('\n')
  const gatewayLine = lines[0]
  assert(gatewayLine, 'gateway value is missing')
  assert(gatewayLine.startsWith('default via'), `unexpected format for gateway value line: ${gatewayLine}`)
  const gatewayLineParts = gatewayLine.split(' ')
  const gateway = gatewayLineParts[2]
  assert(gateway, `missing gateway: ${gatewayLine}`)
  return gateway
}

function parseDNSServers(result: string): string {
  const lines = result.split('\n')
  const nameserverLines = lines.filter(line => line.startsWith('nameserver'))
  const nameservers = nameserverLines.map(line => line.split(' ')[1]).filter(server => !!server)
  return nameservers.join(' ')
}
