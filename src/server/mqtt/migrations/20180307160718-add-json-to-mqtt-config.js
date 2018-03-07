// @flow

import type SequelizeClass, {QueryInterface} from 'sequelize'

const MQTTConfigs = 'MQTTConfigs'

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    const {sequelize} = queryInterface
    await queryInterface.changeColumn(MQTTConfigs, 'groupId', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.changeColumn(MQTTConfigs, 'nodeId', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn(MQTTConfigs, 'protocol', {
      type: Sequelize.ENUM('SPARKPLUG', 'TEXT_JSON'),
    })
    await sequelize.query(`UPDATE "${MQTTConfigs}" SET protocol = 'SPARKPLUG'`)
    await sequelize.query(`ALTER TABLE "${MQTTConfigs}" ALTER COLUMN "protocol" SET NOT NULL`)
    await queryInterface.addColumn(MQTTConfigs, 'dataTopic', {
      type: Sequelize.STRING,
      allowNull: true,
    })
    await queryInterface.addColumn(MQTTConfigs, 'metadataTopic', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },
  async down(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    const {sequelize} = queryInterface
    await queryInterface.removeColumn(MQTTConfigs, 'protocol')
    await queryInterface.removeColumn(MQTTConfigs, 'dataTopic')
    await queryInterface.removeColumn(MQTTConfigs, 'metadataTopic')
    await sequelize.query(`DROP TYPE "enum_MQTTConfigs_protocol"`)
    await queryInterface.changeColumn(MQTTConfigs, 'groupId', {
      type: Sequelize.STRING,
      allowNull: false,
    })
    await queryInterface.changeColumn(MQTTConfigs, 'nodeId', {
      type: Sequelize.STRING,
      allowNull: false,
    })
  },
}

