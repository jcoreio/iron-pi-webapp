// @flow

import Sequelize, {Model} from 'sequelize'
import type {
  ChannelConfig, ChannelMode, DigitalInputConfig, DigitalOutputConfig, SetAnalogInputState,
  SetDisabledState
} from '../../universal/types/Channel'
import {channelIdPattern, ChannelConfigType} from '../../universal/types/Channel'
import {setChannelStates} from '../localio/ChannelStates'

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

export function updateChannelState(channel: Channel) {
  const {id, mode, config} = channel
  switch (mode) {
  case 'ANALOG_INPUT':
    setChannelStates(({id, mode}: SetAnalogInputState))
    break
  case 'DIGITAL_INPUT': {
    const reversePolarity = (config: DigitalInputConfig).reversePolarity || false
    setChannelStates({id, mode, reversePolarity})
    break
  }
  case 'DIGITAL_OUTPUT': {
    const safeState = (config: DigitalOutputConfig).safeState || 0
    const reversePolarity = (config: DigitalOutputConfig).reversePolarity || false
    setChannelStates({id, mode, safeState, reversePolarity})
    break
  }
  case 'DISABLED':
    setChannelStates(({id, mode}: SetDisabledState))
    break
  }
}

function updateChannelStateHook(channel: Channel) {
  if (channel.changed('mode') || channel.changed('config')) {
    updateChannelState(channel)
  }
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

    this.afterCreate(updateChannelStateHook)
    this.afterUpdate(updateChannelStateHook)
  }

  static initAssociations() {
  }
}

