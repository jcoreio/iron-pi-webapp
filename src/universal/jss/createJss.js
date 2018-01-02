// @flow

import {create} from 'jss'
import type {Jss} from 'jss'

import preset from 'jss-preset-default'

export default function createJss(): Jss {
  return create(preset())
}

