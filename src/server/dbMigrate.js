#!/usr/bin/env babel-node
/**
 * @flow
 *
 * Standaline script to initialize database
 */

import migrate from './sequelize/migrate'
import createSequelize from './sequelize'
import createUmzug from './sequelize/umzug'

const sequelize = createSequelize()
const umzug = createUmzug({sequelize})

migrate({sequelize, umzug})
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error.stack) // eslint-disable-line no-console
    process.exit(1)
  })

