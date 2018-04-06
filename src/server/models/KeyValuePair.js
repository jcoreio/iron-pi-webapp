// @flow

import Sequelize, {Model} from 'sequelize'

export type KeyValuePairInitAttributes = {
  key: string;
  value: any;
}

export type KeyValuePairAttributes = KeyValuePairInitAttributes & {
  createdAt: Date;
  updatedAt: Date;
}

export default class KeyValuePair extends Model<KeyValuePairAttributes, KeyValuePairInitAttributes> {
  key: string;
  value: any;
  createdAt: Date;
  updatedAt: Date;

  static initAttributes({sequelize}: {sequelize: Sequelize}) {
    super.init({
      key: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      value: {
        type: Sequelize.JSON,
        allowNull: true,
      },
    }, {sequelize})
  }

  static initAssociations() {
  }

  static async getValue(key: string): Promise<any> {
    const instance = await KeyValuePair.findById(key)
    return instance ? instance.value : null
  }

  static async setValue(key: string, value: any): Promise<void> {
    await KeyValuePair.upsert({key, value})
  }
}
