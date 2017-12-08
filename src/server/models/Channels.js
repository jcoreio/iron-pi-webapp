// @flow

import Sequelize from 'sequelize'
import sequelize from '../sequelize'

const Channels = sequelize.define('Channels', {
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
})

export default Channels

