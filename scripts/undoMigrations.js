// @flow
/* eslint-disable flowtype/require-return-type, flowtype/require-parameter-type */

const inquirer = require('inquirer')

async function undoMigrations(rule /* : {args: Array<string>} */) /* : Promise<any> */ {
  let migrationsToUndo = rule.args.filter(arg => arg[0] !== '-')

  require('defaultenv')(['env/local.js'])
  require('babel-register')
  const {umzug} = require('../src/server/sequelize/migrate')

  if (!migrationsToUndo.length) {
    migrationsToUndo = (await inquirer.prompt([
      {
        message: 'Select migrations to undo',
        type: 'checkbox',
        name: 'migrationsToUndo',
        choices: await umzug.storage.executed()
      }
    ])).migrationsToUndo
  }

  if (!migrationsToUndo.length) {
    console.error('No migrations selected') // eslint-disable-line no-console
    return
  }

  await umzug.down({migrations: migrationsToUndo})
}

module.exports = undoMigrations


