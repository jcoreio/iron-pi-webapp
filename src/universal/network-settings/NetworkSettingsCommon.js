// @flow
/* @flow-runtime enable */

import {reify, validate} from 'flow-runtime'
import type {Type, Validation} from 'flow-runtime'

import type {IPv4Address} from '../types/IPv4Address'
import type {DNSServers} from '../types/DNSServers'

export type NetworkSettings = {
  dhcpEnabled: boolean,
  ipAddress?: ?IPv4Address,
  netmask?: ?IPv4Address,
  gateway?: ?IPv4Address,
  dnsServers?: ?DNSServers,
}
export const NetworkSettingsType = (reify: Type<NetworkSettings>)

export type DHCPNetworkSettings = {
  dhcpEnabled: true,
  ipAddress?: ?IPv4Address,
  netmask?: ?IPv4Address,
  gateway?: ?IPv4Address,
  dnsServers?: ?DNSServers,
}
export const DHCPNetworkSettingsType = (reify: Type<DHCPNetworkSettings>)

export type StaticNetworkSettings = {
  dhcpEnabled: false,
  ipAddress: IPv4Address,
  netmask: IPv4Address,
  gateway?: ?IPv4Address,
  dnsServers?: ?DNSServers,
}
export const StaticNetworkSettingsType = (reify: Type<StaticNetworkSettings>)

// Networking modes that can be triggered from the connect button
export const NETWORK_MODE_STATIC = 'static'
export const NETWORK_MODE_DHCP = 'dhcp'

export function normalizeIPv4Address(address: string): string {
  address = address.trim()
  const bytes = address.split('.')
  if (bytes.length !== 4) throw new Error('Invalid IPv4 Address: ' + address)
  return bytes.map((byte: string) => {
    const parsed = parseInt(byte)
    if (!byte.length || /\D/.test(byte) || parsed > 255) throw new Error('Invalid IPv4 Address: ' + address)
    return parsed
  }).join('.')
}

export function validateNetworkSettings(settings: NetworkSettings): Validation {
  return validate(
    settings.dhcpEnabled ? DHCPNetworkSettingsType : StaticNetworkSettingsType,
    settings
  )
}

export function validateNetworkSettingsForHandler(settings: NetworkSettings): Array<string> {
  const errors: Array<string> = []
  const validation = validateNetworkSettings(settings)
  for (let [path, message] of validation.errors) {
    errors.push(`${path.join('.')} ${message}`)
  }

  return errors
}

