// @flow

import type SequelizeClass, {QueryInterface} from 'sequelize'

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.createTable('Channels', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: false,
        validate: {
          min: 0,
        },
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      channelId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          is: /^[a-z0-9]+(\/[a-z0-9]+)*$/i,
        },
      },
      mode: {
        type: Sequelize.ENUM('ANALOG_INPUT', 'DIGITAL_INPUT', 'DIGITAL_OUTPUT', 'DISABLED'),
        allowNull: false,
        defaultValue: 'DISABLED',
      },
      config: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {},
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    })
  },
  async down(queryInterface: QueryInterface, Sequelize: SequelizeClass): Promise<void> {
    await queryInterface.dropTable('Channels')
  },
}

