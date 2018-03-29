// @flow

import type SequelizeClass, {QueryInterface} from 'sequelize'

const scopes = [
  ['create:users', 'allows creating users'],
  ['update:users', 'allows updating users'],
  ['destroy:users', 'allows destroying users'],
]

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await Promise.all(scopes.map(replacements => queryInterface.sequelize.query(
      `INSERT INTO "Scopes" (id, description, "createdAt", "updatedAt") VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      {replacements}
    )))
  },
  async down(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await Promise.all(scopes.map(([scope]) => queryInterface.sequelize.query(
      `DELETE FROM "Scopes" WHERE id = ?`,
      {replacements: [scope]}
    )))
  },
}

