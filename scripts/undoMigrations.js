// @flow
/* eslint-disable flowtype/require-return-type, flowtype/require-parameter-type */

import initDatabase from '../src/server/initDatabase'
import inquirer from 'inquirer'

async function undoMigrations(rule: {args: Array<string>}): Promise<any> {
  let migrationsToUndo = rule.args.filter(arg => arg[0] !== '-')

  require('defaultenv')(['env/local.js'])
  require('babel-register')
  const {sequelize, umzug} = await initDatabase()

  if (!migrationsToUndo.length) {
    migrationsToUndo = (await inquirer.prompt([
      {
        message: 'Select migrations to undo',
        type: 'checkbox',
        name: 'migrationsToUndo',
        choices: (await umzug.executed()).map(migration => migration.name || migration.file)
      }
    ])).migrationsToUndo
  }

  if (!migrationsToUndo.length) {
    console.error('No migrations selected') // eslint-disable-line no-console
    return
  }

  await umzug.down({migrations: migrationsToUndo})
  await sequelize.close()
}

module.exports = undoMigrations


