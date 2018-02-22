// @flow

import type SequelizeClass, {QueryInterface} from 'sequelize'

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.sequelize.query(`INSERT INTO "Scopes" (id, description, "createdAt", "updatedAt") VALUES (?, ?, ?, ?)`, {
      replacements: ['localio:setRemoteControlValues', 'allows a user to update the values of remote control channels', new Date(), new Date()],
    })
  },
  async down(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.sequelize.query(`DELETE FROM "Scopes" where id = ?`, {
      replacements: ['localio:setRemoteControlValues'],
    })
  },
}

