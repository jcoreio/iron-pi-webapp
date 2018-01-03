// @flow

import Sequelize, {Model} from 'sequelize'
import type {ChannelConfig, ChannelMode} from '../../universal/types/Channel'
import {channelIdPattern, ChannelConfigType} from '../../universal/types/Channel'

export type ChannelInitAttributes = {
  id: number;
  name: string;
  channelId: string;
}

export type ChannelAttributes = ChannelInitAttributes & {
  createdAt: Date;
  updatedAt: Date;
  mode: ChannelMode;
  config: ChannelConfig;
}

export default class Channel extends Model<ChannelAttributes, ChannelInitAttributes> {
  id: number;
  name: string;
  channelId: string;
  mode: ChannelMode;
  config: ChannelConfig;
  createdAt: Date;
  updatedAt: Date;

  static initAttributes({sequelize}: {sequelize: Sequelize}) {
    super.init({
      id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          is: /^\S(.*\S)?$/, // no whitespace at beginning or end
        }
      },
      channelId: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          is: channelIdPattern,
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
        validate: {
          isValid: config => ChannelConfigType.assert(config),
        },
      },
    }, {sequelize})
  }

  static initAssociations() {
  }
}

