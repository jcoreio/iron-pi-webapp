// @flow

import Sequelize, {Model, Association} from 'sequelize'
import type {
  HasManyGetMany,
  HasManySetMany,
  HasManyAddMany,
  HasManyAddOne,
  HasManyCreateOne,
  HasManyRemoveOne,
  HasManyRemoveMany,
  HasManyHasOne,
  HasManyHasMany,
  HasManyCount,
} from 'sequelize'
import MQTTChannelConfig, {FROM_MQTT, TO_MQTT} from './MQTTChannelConfig'
import type {MQTTChannelConfigAttributes, MQTTChannelConfigInitAttributes} from './MQTTChannelConfig'
import {mqttUrlPattern} from '../../../universal/types/MQTTUrl'

type Protocol = 'SPARKPLUG' | 'TEXT_JSON'

export type MQTTConfigInitAttributes = {
  name: string;
  serverURL: string;
  username: string;
  password: string;
  protocol: Protocol;
}

export type MQTTConfigAttributes = MQTTConfigInitAttributes & {
  id: number;
  minPublishInterval: number;
  publishAllPublicTags: boolean;
  dataTopic: ?string;
  metadataTopic: ?string;
  groupId: ?string;
  nodeId: ?string;
  createdAt: Date;
  updatedAt: Date;
}

const notWhitespace = {
  args: /^\s*$/,
  msg: 'must not be empty',
}

export default class MQTTConfig extends Model<MQTTConfigAttributes, MQTTConfigInitAttributes> {
  id: number;
  name: string;
  serverURL: string;
  username: string;
  password: string;
  groupId: ?string;
  nodeId: ?string;
  protocol: Protocol;
  minPublishInterval: number;
  publishAllPublicTags: boolean;
  dataTopic: ?string;
  metadataTopic: ?string;
  createdAt: Date;
  updatedAt: Date;
  channelsToMQTT: ?Array<MQTTChannelConfig>;
  channelsFromMQTT: ?Array<MQTTChannelConfig>;

  static ChannelsToMQTT: Association.HasMany<MQTTConfig, MQTTChannelConfigAttributes, MQTTChannelConfigInitAttributes, MQTTChannelConfig> = (null: any)

  getChannelsToMQTT: HasManyGetMany<MQTTChannelConfig>
  setChannelsToMQTT: HasManySetMany<MQTTChannelConfig, number>
  addChannelsToMQTT: HasManyAddMany<MQTTChannelConfig, number>
  addChannelToMQTT: HasManyAddOne<MQTTChannelConfig, number>
  createChannelToMQTT: HasManyCreateOne<MQTTChannelConfigInitAttributes, MQTTChannelConfig>
  removeChannelToMQTT: HasManyRemoveOne<MQTTChannelConfig, number>
  removeChannelsToMQTT: HasManyRemoveMany<MQTTChannelConfig, number>
  hasChannelToMQTT: HasManyHasOne<MQTTChannelConfig, number>
  hasChannelsToMQTT: HasManyHasMany<MQTTChannelConfig, number>
  countChannelsToMQTT: HasManyCount

  static ChannelsFromMQTT: Association.HasMany<MQTTConfig, MQTTChannelConfigAttributes, MQTTChannelConfigInitAttributes, MQTTChannelConfig> = (null: any)

  getChannelsFromMQTT: HasManyGetMany<MQTTChannelConfig>
  setChannelsFromMQTT: HasManySetMany<MQTTChannelConfig, number>
  addChannelsFromMQTT: HasManyAddMany<MQTTChannelConfig, number>
  addChannelFromMQTT: HasManyAddOne<MQTTChannelConfig, number>
  createChannelFromMQTT: HasManyCreateOne<MQTTChannelConfigInitAttributes, MQTTChannelConfig>
  removeChannelFromMQTT: HasManyRemoveOne<MQTTChannelConfig, number>
  removeChannelsFromMQTT: HasManyRemoveMany<MQTTChannelConfig, number>
  hasChannelFromMQTT: HasManyHasOne<MQTTChannelConfig, number>
  hasChannelsFromMQTT: HasManyHasMany<MQTTChannelConfig, number>
  countChannelsFromMQTT: HasManyCount

  static initAttributes({sequelize}: {sequelize: Sequelize}) {
    super.init({
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          not: notWhitespace,
        },
      },
      serverURL: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          is: {
            args: mqttUrlPattern,
            msg: 'must be a valid MQTT URL'
          },
        },
      },
      protocol: {
        type: Sequelize.ENUM('SPARKPLUG', 'TEXT_JSON'),
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        validate: {
          not: notWhitespace,
        },
      },
      password: {
        type: Sequelize.STRING,
        validate: {
          not: notWhitespace,
        },
      },
      groupId: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          not: notWhitespace,
        },
      },
      nodeId: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          not: notWhitespace,
        },
      },
      dataTopic: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      metadataTopic: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      minPublishInterval: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      publishAllPublicTags: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    }, {
      sequelize,
    })
  }

  static initAssociations() {
    this.ChannelsFromMQTT = this.hasMany(MQTTChannelConfig, {
      as: 'channelsFromMQTT',
      foreignKey: 'configId',
      onDelete: 'CASCADE',
      scope: {
        direction: FROM_MQTT,
      },
    })
    this.ChannelsToMQTT = this.hasMany(MQTTChannelConfig, {
      as: 'channelsToMQTT',
      foreignKey: 'configId',
      onDelete: 'CASCADE',
      scope: {
        direction: TO_MQTT,
      },
    })
  }
}

