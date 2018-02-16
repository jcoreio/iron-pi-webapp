// @flow

import Sequelize, {Model} from 'sequelize'
import {tagPattern} from '../../universal/types/Tag'
import {validateWithFlowRuntime} from 'sequelize-validate-subfields-flow-runtime'
import type {MetadataItem as Item} from '../../universal/types/MetadataItem'
import {MetadataItemType} from '../../universal/types/MetadataItem'

export type MetadataItemInitAttributes = {
  tag: string;
  item: Item;
}

export type MetadataItemAttributes = MetadataItemInitAttributes & {
  createdAt: Date;
  updatedAt: Date;
}

export default class MetadataItem extends Model<MetadataItemAttributes, MetadataItemInitAttributes> {
  tag: string;
  item: Item;
  createdAt: Date;
  updatedAt: Date;

  static initAttributes({sequelize}: {sequelize: Sequelize}) {
    super.init({
      tag: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
        validate: {
          is: {
            args: tagPattern,
            msg: 'must be a valid tag'
          },
        }
      },
      item: {
        type: Sequelize.JSON,
        allowNull: false,
        validate: {
          isValid: validateWithFlowRuntime(MetadataItemType, {reduxFormStyle: true})
        },
      },
    }, {
      sequelize,
      modelName: 'Metadata',
      name: {
        singular: 'MetadataItem',
        plural: 'Metadata',
      }
    })
  }

  static initAssociations() {
  }
}

