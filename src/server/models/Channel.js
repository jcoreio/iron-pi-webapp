// @flow

import Sequelize, {Model} from 'sequelize'
import type {ChannelConfig, ChannelMode} from '../../universal/types/Channel'
import {channelIdPattern, validateChannelConfig} from '../../universal/types/Channel'
import {validateWithFlowRuntime} from 'sequelize-validate-subfields-flow-runtime'

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

export default class Channel extends Model<ChannelAttributes, ChannelInitAttributes> {
  physicalChannelId: ?number;
  name: string;
  id: string;
  mode: ChannelMode;
  config: ChannelConfig;
  createdAt: Date;
  updatedAt: Date;

  static initAttributes(options: {sequelize: Sequelize}) {
    const {sequelize} = options
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
        unique: true,
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
  }

  static initAssociations() {
  }
}

