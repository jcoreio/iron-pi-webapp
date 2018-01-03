// @flow

import type {Superagent} from 'superagent'

type Options = {
  prefix?: string,
}

export default function createSuperagent({prefix}: Options): Superagent {
  const superagent: Superagent = require('superagent-use')(require('superagent'))
  if (prefix) superagent.use(require('superagent-prefix')(prefix))
  if (process.env.SUPERAGENT_LOGGER) superagent.use(require('superagent-logger')({outgoing: true}))

  return superagent
}

