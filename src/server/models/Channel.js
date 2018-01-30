// @flow

import Sequelize, {Model} from 'sequelize'
import type {ChannelConfig, ChannelMode} from '../../universal/types/Channel'
import {channelIdPattern, validateChannelConfig} from '../../universal/types/Channel'
import {validateWithFlowRuntime} from 'sequelize-validate-subfields-flow-runtime'
import type {Store} from '../redux/types'
import {setChannelConfigs} from '../redux'

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

export function updateChannelState(store: Store, channel: Channel) {
  const {id, config} = channel
  store.dispatch(setChannelConfigs({id, config}))
}

export default class Channel extends Model<ChannelAttributes, ChannelInitAttributes> {
  id: number;
  name: string;
  channelId: string;
  mode: ChannelMode;
  config: ChannelConfig;
  createdAt: Date;
  updatedAt: Date;

  static initAttributes(options: {sequelize: Sequelize, store?: Store}) {
    const {sequelize, store} = options
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

    function updateChannelStateHook(channel: Channel) {
      if (store && channel.changed('config')) {
        updateChannelState(store, channel)
      }
    }

    this.afterCreate(updateChannelStateHook)
    this.afterUpdate(updateChannelStateHook)
  }

  static initAssociations() {
  }
}

