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

export type MQTTConfigInitAttributes = {
  name: string;
  serverURL: string;
  username: string;
  password: string;
  groupId: string;
  nodeId: string;
}

export type MQTTConfigAttributes = MQTTConfigInitAttributes & {
  id: number;
  minPublishInterval: number;
  publishAllPublicTags: boolean;
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
  groupId: string;
  nodeId: string;
  minPublishInterval: number;
  publishAllPublicTags: boolean;
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
          isUrl: true,
        },
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          not: notWhitespace,
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          not: notWhitespace,
        },
      },
      groupId: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          not: notWhitespace,
        },
      },
      nodeId: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          not: notWhitespace,
        },
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
    }, {sequelize})
  }

  static initAssociations() {
    this.ChannelsFromMQTT = this.hasMany(MQTTChannelConfig, {
      as: 'channelsFromMQTT',
      foreignKey: 'configId',
      scope: {
        direction: FROM_MQTT,
      },
    })
    this.ChannelsToMQTT = this.hasMany(MQTTChannelConfig, {
      as: 'channelsToMQTT',
      foreignKey: 'configId',
      scope: {
        direction: TO_MQTT,
      },
    })
  }
}

