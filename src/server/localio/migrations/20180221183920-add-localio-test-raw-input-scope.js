// @flow

import type SequelizeClass, {QueryInterface} from 'sequelize'

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.sequelize.query(`INSERT INTO "Scopes" (id, description, "createdAt", "updatedAt") VALUES (?, ?, ?, ?)`, {
      replacements: ['localio:test:setRawInputs', 'allows a user to set the raw inputs of local channels', new Date(), new Date()],
    })
  },
  async down(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.sequelize.query(`DELETE FROM "Scopes" where id = ?`, {
      replacements: ['localio:test:setRawInputs'],
    })
  },
}

