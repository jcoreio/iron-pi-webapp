// @flow

import type SequelizeClass, {QueryInterface} from 'sequelize'

const MQTTConfigs = 'MQTTConfigs'

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.addColumn(MQTTConfigs, 'dataFromMQTTTimeout', {
      type: Sequelize.INTEGER,
      allowNull: true,
    })
  },
  async down(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.removeColumn(MQTTConfigs, 'dataFromMQTTTimeout')
  },
}
