// @flow
/* @flow-runtime enable */

import isIp from 'is-ip'

import {reify} from 'flow-runtime'
import type {Type} from 'flow-runtime'

export type IPv4Address = string
export const IPv4AddressType = (reify: Type<IPv4Address>)
IPv4AddressType.addConstraint((address: any): ?string => {
  if (!isIp.v4(address)) return 'must be 4 numbers between 0 and 255, separated by periods'
})

