// @flow

import Sequelize, {Model} from 'sequelize'
import type {
  AnalogInputConfig,
  ChannelConfig, ChannelMode, DigitalInputConfig, DigitalOutputConfig, SetAnalogInputState,
  SetDisabledState
} from '../../universal/types/Channel'
import {channelIdPattern, validateChannelConfig} from '../../universal/types/Channel'
import {setChannelStates} from '../localio/ChannelStates'
import {validateWithFlowRuntime} from 'sequelize-validate-subfields-flow-runtime'

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
  case 'ANALOG_INPUT': {
    const {calibration}: AnalogInputConfig = (config: any)
    setChannelStates(({id, mode, calibration}: SetAnalogInputState))
    break
  }
  case 'DIGITAL_INPUT': {
    const {reversePolarity}: DigitalInputConfig = (config: any)
    setChannelStates({id, mode, reversePolarity})
    break
  }
  case 'DIGITAL_OUTPUT': {
    const {safeState, reversePolarity, controlMode}: DigitalOutputConfig = (config: any)
    const state = {id, mode, safeState, reversePolarity}
    if (controlMode === 'FORCE_OFF') (state: any).controlValue = 0
    else if (controlMode === 'FORCE_ON') (state: any).controlValue = 1
    setChannelStates(state)
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
          isValid: validateWithFlowRuntime(validateChannelConfig, {reduxFormStyle: true})
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

