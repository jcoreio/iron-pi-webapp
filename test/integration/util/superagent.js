// @flow

import createSuperagent from '../../util/createSuperagent'
const requireEnv = require('@jcoreio/require-env')
const port = parseInt(requireEnv('INTEGRATION_SERVER_PORT'))

module.exports = createSuperagent({prefix: `http://localhost:${port}`})

