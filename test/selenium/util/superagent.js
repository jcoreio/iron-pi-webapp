// @flow

import createSuperagent from '../../util/createSuperagent'
const requireEnv = require('@jcoreio/require-env')
module.exports = createSuperagent({prefix: requireEnv('ROOT_URL')})

