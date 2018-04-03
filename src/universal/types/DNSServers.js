// @flow
/* @flow-runtime enable */

import isIp from 'is-ip'

import {reify} from 'flow-runtime'
import type {Type} from 'flow-runtime'

export type DNSServers = string
export const DNSServersType = (reify: Type<DNSServers>)

export function splitDNSAddresses(addresses: string): Array<string> {
  return addresses.trim().split(/\s+/g)
}

DNSServersType.addConstraint((servers: string) => {
  const addresses = splitDNSAddresses(servers)
  for (let address of addresses) {
    if (!isIp.v4(address)) return `not a valid IPv4 address: ${address}`
  }
})


