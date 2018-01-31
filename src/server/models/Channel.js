// @flow

import Sequelize, {Model} from 'sequelize'
import type {ChannelConfig, ChannelMode} from '../../universal/types/Channel'
import {channelIdPattern, validateChannelConfig} from '../../universal/types/Channel'
import {validateWithFlowRuntime} from 'sequelize-validate-subfields-flow-runtime'
import type {Store} from '../redux/types'
import {setChannelConfigs} from '../redux'

export type ChannelInitAttributes = {
  name: string;
  id: string;
  config?: ChannelConfig;
}

export type ChannelAttributes = ChannelInitAttributes & {
  physicalChannelId?: number;
  createdAt: Date;
  updatedAt: Date;
  config: ChannelConfig;
}

export function updateChannelState(store: Store, channel: Channel) {
  const {id, config} = channel
  store.dispatch(setChannelConfigs({channelId: id, config}))
}

export default class Channel extends Model<ChannelAttributes, ChannelInitAttributes> {
  physicalChannelId: ?number;
  name: string;
  id: string;
  mode: ChannelMode;
  config: ChannelConfig;
  createdAt: Date;
  updatedAt: Date;

  static initAttributes(options: {sequelize: Sequelize, store?: Store}) {
    const {sequelize, store} = options
    super.init({
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        validate: {
          is: {
            args: channelIdPattern,
            msg: 'must be a valid channel ID'
          },
        },
      },
      physicalChannelId: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
      if (store && (channel.changed('config') || channel.changed('id'))) {
        updateChannelState(store, channel)
      }
    }

    this.afterCreate(updateChannelStateHook)
    this.afterUpdate(updateChannelStateHook)
  }

  static initAssociations() {
  }
}

