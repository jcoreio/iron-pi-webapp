// @flow

import type SequelizeClass, {QueryInterface} from 'sequelize'

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.addColumn('Channels', 'config', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {},
    })
  },
  async down(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.removeColumn('Channels', 'config')
  },
}

