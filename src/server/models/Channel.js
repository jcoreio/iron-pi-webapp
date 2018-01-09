// @flow

import Sequelize, {Model} from 'sequelize'
import type {
  ChannelConfig, ChannelMode, DigitalInputConfig, DigitalOutputConfig, SetAnalogInputState,
  SetDisabledState
} from '../../universal/types/Channel'
import {channelIdPattern, validateChannelConfig} from '../../universal/types/Channel'
import {setChannelStates} from '../localio/ChannelStates'
import validateWithFlowRuntime from '../sequelize/validateWithFlowRuntime'

export type ChannelInitAttributes = {
  id: number;
  name: string;
  channelId: string;
  config?: ChannelConfig;
}

export type ChannelAttributes = ChannelInitAttributes & {
  createdAt: Date;
  updatedAt: Date;
  config: ChannelConfig;
}

export function updateChannelState(channel: Channel) {
  const {id, config} = channel
  const {mode} = config
  switch (mode) {
  case 'ANALOG_INPUT':
    setChannelStates(({id, mode}: SetAnalogInputState))
    break
  case 'DIGITAL_INPUT': {
    const {reversePolarity}: DigitalInputConfig = (config: any)
    setChannelStates({id, mode, reversePolarity})
    break
  }
  case 'DIGITAL_OUTPUT': {
    const {safeState, reversePolarity}: DigitalOutputConfig = (config: any)
    setChannelStates({id, mode, safeState, reversePolarity})
    break
  }
  case 'DISABLED':
    setChannelStates(({id, mode}: SetDisabledState))
    break
  }
}

function updateChannelStateHook(channel: Channel) {
  if (channel.changed('config')) {
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
          is: {
            args: /^\S(.*\S)?$/,
            msg: 'must not start or end with whitespace',
          } // no whitespace at beginning or end
        }
      },
      channelId: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          is: {
            args: channelIdPattern,
            msg: 'must be a valid channel ID'
          },
        },
      },
      config: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {mode: 'DISABLED'},
        validate: {
          isValid: validateWithFlowRuntime(validateChannelConfig)
        },
      },
    }, {
      sequelize,
    })

    this.afterCreate(updateChannelStateHook)
    this.afterUpdate(updateChannelStateHook)
  }

  static initAssociations() {
  }
}

