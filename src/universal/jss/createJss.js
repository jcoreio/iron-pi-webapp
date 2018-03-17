// @flow

import {create} from 'jss'
import type {Jss} from 'jss'


import preset from 'jss-preset-default'

export default function createJss(): Jss {
  // forcibly reset jss moduleId to prevent SSR errors due to hot reloading
  require('jss/lib/utils/moduleId').default = 0
  const result = create(preset())
  result.id = 0
  return result
}

