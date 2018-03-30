// @flow

export type IPAddressMode = 'DHCP' | 'MANUAL'

export const IPAddressModes: {[mode: IPAddressMode]: {displayText: string}} = {
  DHCP: {displayText: 'DHCP'},
  MANUAL: {displayText: 'Manual'},
}

export const IPAddressModesArray = Object.keys(IPAddressModes)

export function getIPAddressModeDisplayText(mode: IPAddressMode): string {
  return IPAddressModes[mode].displayText
}
