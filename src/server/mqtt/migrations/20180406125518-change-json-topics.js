// @flow

import type SequelizeClass, {QueryInterface} from 'sequelize'

const MQTTConfigs = 'MQTTConfigs'

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.renameColumn(MQTTConfigs, 'dataTopic', 'dataToMQTTTopic')
    await queryInterface.renameColumn(MQTTConfigs, 'metadataTopic', 'metadataToMQTTTopic')
    await queryInterface.addColumn(MQTTConfigs, 'dataFromMQTTTopic', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },
  async down(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.renameColumn(MQTTConfigs, 'dataToMQTTTopic', 'dataTopic')
    await queryInterface.renameColumn(MQTTConfigs, 'metadataToMQTTTopic', 'metadataTopic')
    await queryInterface.removeColumn(MQTTConfigs, 'dataFromMQTTTopic')
  },
}
