// @flow

import Sequelize from 'sequelize'
import type {Model} from 'sequelize'
import sequelize from '../sequelize'
import type {Channel as ChannelFields, ChannelMode} from '../../universal/types/Channel'

const Channel: Class<Model<ChannelFields>> = sequelize.define('Channel', {
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
    type: Sequelize.ENUM(...(['ANALOG_INPUT', 'DIGITAL_INPUT', 'DIGITAL_OUTPUT', 'DISABLED']: Array<ChannelMode>)),
    allowNull: false,
    defaultValue: ('DISABLED': ChannelMode),
  },
  config: {
    type: Sequelize.JSON,
    allowNull: false,
    defaultValue: {},
  },
})

export default Channel

