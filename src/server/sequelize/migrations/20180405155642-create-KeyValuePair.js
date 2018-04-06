// @flow

import type SequelizeClass, {QueryInterface} from 'sequelize'

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.createTable(
      'KeyValuePairs',
      {
        key: {
          type: Sequelize.STRING,
          primaryKey: true,
          allowNull: false,
        },
        value: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      }
    )
  },
  async down(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.dropTable('KeyValuePairs')
  },
}

