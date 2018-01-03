// @flow

import createGraphql from '../../util/createGraphql'
import superagent from './superagent'

module.exports = createGraphql(superagent)
