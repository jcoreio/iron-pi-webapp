// @flow

import Sequelize, {Model, Association} from 'sequelize'
import type {BelongsToGetOne, BelongsToSetOne, BelongsToCreateOne} from 'sequelize'
import MQTTConfig from './MQTTConfig'
import type {MQTTConfigAttributes, MQTTConfigInitAttributes} from './MQTTConfig'
import {tagPattern} from '../../../universal/types/Tag'

type Direction = 'TO_MQTT' | 'FROM_MQTT'
export const TO_MQTT = 'TO_MQTT'
export const FROM_MQTT = 'FROM_MQTT'

export type MQTTChannelConfigInitAttributes = {
  configId: number;
  direction: Direction;
  internalTag: string;
  mqttTag: string;
  enabled: boolean;
}

export type MQTTChannelConfigAttributes = MQTTChannelConfigInitAttributes & {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: ?string;
  multiplier: ?number;
  offset: ?number;
}

export default class MQTTChannelConfig extends Model<MQTTChannelConfigAttributes, MQTTChannelConfigInitAttributes> {
  id: number;
  configId: number;
  Config: ?MQTTConfig;
  direction: Direction;
  internalTag: string;
  mqttTag: string;
  enabled: boolean;
  name: ?string;
  multiplier: ?number;
  offset: ?number;
  createdAt: Date;
  updatedAt: Date;

  static Config: Association.BelongsTo<MQTTChannelConfig, MQTTConfigAttributes, MQTTConfigInitAttributes, MQTTConfig> = (null: any)

  getConfig: BelongsToGetOne<MQTTConfig>
  setConfig: BelongsToSetOne<MQTTConfig, number>
  createConfig: BelongsToCreateOne<MQTTConfigInitAttributes>

  static initAttributes({sequelize}: {sequelize: Sequelize}) {
    super.init({
      direction: {
        type: Sequelize.ENUM(FROM_MQTT, TO_MQTT),
        allowNull: false,
      },
      internalTag: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          is: {
            args: tagPattern,
            msg: 'must be a valid tag'
          },
        },
      },
      mqttTag: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      name: {
        type: Sequelize.STRING,
      },
      multiplier: {
        type: Sequelize.FLOAT,
      },
      offset: {
        type: Sequelize.FLOAT,
      },
    }, {sequelize})
  }

  static initAssociations() {
    this.Config = this.belongsTo(MQTTConfig, {
      as: 'Config',
      foreignKey: 'configId',
    })
  }
}

