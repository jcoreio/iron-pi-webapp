// @flow

import type Superagent from 'superagent'

const superagent: Superagent = require('superagent-use')(require('superagent'))
const prefix = require('superagent-prefix')
const requireEnv = require('@jcoreio/require-env')

superagent.use(prefix(requireEnv('ROOT_URL')))
if (process.env.SUPERAGENT_LOGGER) superagent.use(require('superagent-logger')({outgoing: true}))

module.exports = superagent

