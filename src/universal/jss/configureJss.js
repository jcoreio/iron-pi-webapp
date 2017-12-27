// @flow

import defaultJss from 'jss'
import type {Jss} from 'jss'

import preset from 'jss-preset-default'
import expand from 'jss-expand'
import nested from 'jss-nested'

export default function configureJss(jss: Jss = defaultJss) {
  jss.setup(preset())
  jss.use(nested())
  jss.use(expand())
}

