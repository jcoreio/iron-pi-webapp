// @flow

import type SequelizeClass, {QueryInterface} from 'sequelize'

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    const {sequelize} = queryInterface
    await sequelize.query(`ALTER TABLE "MQTTChannelConfigs" DROP CONSTRAINT "MQTTChannelConfigs_configId_fkey"`)
    await sequelize.query(`ALTER TABLE "MQTTChannelConfigs" ADD CONSTRAINT "MQTTChannelConfigs_configId_fkey" FOREIGN KEY ("configId") REFERENCES "MQTTConfigs"(id) ON DELETE CASCADE`)
  },
  async down(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    const {sequelize} = queryInterface
    await sequelize.query(`ALTER TABLE "MQTTChannelConfigs" DROP CONSTRAINT "MQTTChannelConfigs_configId_fkey"`)
    await sequelize.query(`ALTER TABLE "MQTTChannelConfigs" ADD CONSTRAINT "MQTTChannelConfigs_configId_fkey" FOREIGN KEY ("configId") REFERENCES "MQTTConfigs"(id)`)
  },
}

