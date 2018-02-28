// @flow

import type SequelizeClass, {QueryInterface} from 'sequelize'

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.createTable(
      'MQTTConfigs',
      {
        id: {
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        serverURL: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        username: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        groupId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        nodeId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        minPublishInterval: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        publishAllPublicTags: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
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
    await queryInterface.createTable(
      'MQTTChannelConfigs',
      {
        id: {
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        configId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'MQTTConfigs',
            key: 'id',
          },
        },
        direction: {
          type: Sequelize.ENUM('FROM_MQTT', 'TO_MQTT'),
          allowNull: false,
        },
        internalTag: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        mqttTag: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        enabled: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        name: {
          type: Sequelize.STRING,
        },
        multiplier: {
          type: Sequelize.FLOAT,
        },
        offset: {
          type: Sequelize.FLOAT,
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
    await queryInterface.dropTable('MQTTChannelConfigs')
    await queryInterface.dropTable('MQTTConfigs')
  },
}

