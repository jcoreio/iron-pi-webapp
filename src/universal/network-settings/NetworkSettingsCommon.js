// @flow

export type NetworkSettings = {
  dhcpEnabled: boolean,
  ipAddress: string,
  netmask: string,
  gateway: string,
  dnsServers: string,
}

// Networking modes that can be triggered from the connect button
export const NETWORK_MODE_STATIC = 'static'
export const NETWORK_MODE_DHCP = 'dhcp'

export function isValidIPv4Address(address: string): boolean {
  const bytes = address.split('.')
  if (bytes.length !== 4) return false

  for (let byte of bytes) {
    byte = byte.trim()
    if (!byte.length || /\D/.test(byte) || parseInt(byte) > 255) return false
  }

  return true
}

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

export function validateNetworkSettings(settings: NetworkSettings): Array<string> {
  const errors: Array<string> = []

  const validateIPAddress = (value: string, name: string, requiredIfNotDHCP: boolean) => {
    if (!settings.dhcpEnabled && !value && requiredIfNotDHCP) return errors.push(`${name} is required`)
    if (value && !isValidIPv4Address(value)) return errors.push(`${name} must be 4 numbers between 0 and 255, separated by periods`)
  }

  validateIPAddress(settings.ipAddress, 'IP Address', true)
  validateIPAddress(settings.netmask, 'Netmask', true)
  validateIPAddress(settings.gateway, 'Gateway', false)
  const dnsServers = (settings.dnsServers || '').match(/\S+/g) || []
  //if (!settings.dhcpEnabled && !dnsServers.length) errors.push('DNS Server is required')
  dnsServers.forEach(server => validateIPAddress(server, 'DNS Server', false))

  return errors
}
