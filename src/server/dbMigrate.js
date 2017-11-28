#!/usr/bin/env babel-node
/**
 * @flow
 *
 * Standaline script to initialize database
 */

import migrate from './sequelize/migrate'

migrate()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error.stack) // eslint-disable-line no-console
    process.exit(1)
  })

