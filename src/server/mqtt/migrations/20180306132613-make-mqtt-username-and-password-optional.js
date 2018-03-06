// @flow

import type SequelizeClass, {QueryInterface} from 'sequelize'

const MQTTConfigs = 'MQTTConfigs'

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.changeColumn(MQTTConfigs, 'username', {type: Sequelize.STRING, allowNull: true})
    await queryInterface.changeColumn(MQTTConfigs, 'password', {type: Sequelize.STRING, allowNull: true})
  },
  async down(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.changeColumn(MQTTConfigs, 'username', {type: Sequelize.STRING, allowNull: false})
    await queryInterface.changeColumn(MQTTConfigs, 'password', {type: Sequelize.STRING, allowNull: false})
  },
}

