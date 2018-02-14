// @flow

import Sequelize, {Model} from 'sequelize'
import type {LocalIOChannelConfig} from '../../universal/localio/LocalIOChannel'
import {validateLocalIOChannelConfig} from '../../universal/localio/LocalIOChannel'
import {tagPattern} from '../../universal/types/Tag'
import type {Tag} from '../../universal/types/Tag'
import {validateWithFlowRuntime} from 'sequelize-validate-subfields-flow-runtime'

export type LocalIOChannelInitAttributes = {
  id: number;
  tag: Tag;
  config?: LocalIOChannelConfig;
}

export type LocalIOChannelAttributes = LocalIOChannelInitAttributes & {
  createdAt: Date;
  updatedAt: Date;
  config: LocalIOChannelConfig;
}

export default class LocalIOChannel extends Model<LocalIOChannelAttributes, LocalIOChannelInitAttributes> {
  id: number;
  tag: Tag;
  config: LocalIOChannelConfig;
  createdAt: Date;
  updatedAt: Date;

  static initAttributes(options: {sequelize: Sequelize}) {
    const {sequelize} = options
    super.init({
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        validate: {
          min: 0,
        },
      },
      tag: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          is: {
            args: tagPattern,
            msg: 'must be a valid tag'
          },
        },
      },
      config: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {mode: 'DISABLED'},
        validate: {
          isValid: validateWithFlowRuntime(validateLocalIOChannelConfig, {reduxFormStyle: true})
        },
      },
    }, {
      sequelize,
    })
  }

  static initAssociations() {
  }
}

