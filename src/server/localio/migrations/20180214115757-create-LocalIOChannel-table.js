// @flow

import type SequelizeClass, {QueryInterface} from 'sequelize'

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.createTable(
      'LocalIOChannels',
      {
        id: {
          primaryKey: true,
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        tag: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        config: {
          type: Sequelize.JSON,
          allowNull: false,
          defaultValue: {mode: 'DISABLED'},
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
    await queryInterface.dropTable('LocalIOChannels')
  },
}

