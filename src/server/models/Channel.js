// @flow

import Sequelize, {Model} from 'sequelize'
import type {ChannelMode} from '../../universal/types/Channel'
import {channelIdPattern} from '../../universal/types/Channel'

export type ChannelInitAttributes = {
  id: number;
  name: string;
  channelId: string;
  mode: ChannelMode;
}

export type ChannelAttributes = ChannelInitAttributes & {
  createdAt: Date;
  updatedAt: Date;
}

export default class Channel extends Model<ChannelAttributes, ChannelInitAttributes> {
  id: number;
  name: string;
  channelId: string;
  mode: ChannelMode;
  createdAt: Date;
  updatedAt: Date;

  static initAttributes({sequelize}: {sequelize: Sequelize}) {
    super.init({
      id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        min: 0,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        is: /^\S(.*\S)?$/, // no whitespace at beginning or end
      },
      channelId: {
        type: Sequelize.STRING,
        allowNull: false,
        is: channelIdPattern,
      },
      mode: {
        type: Sequelize.ENUM('ANALOG_INPUT', 'DIGITAL_INPUT', 'DIGITAL_OUTPUT', 'DISABLED'),
        allowNull: false,
        defaultValue: 'DISABLED',
      },
    }, {sequelize})
  }

  static initAssociations() {
  }
}

