// @flow

import type {Model} from 'sequelize'

export type GetTopic<TAttributes> = (model: Class<Model<TAttributes>>) => (instance: $Shape<TAttributes>) => string

export const defaultGetTopic: GetTopic<any> = (model: Class<Model<any>>) => {
  const {primaryKeyAttributes} = model
  if (primaryKeyAttributes.length === 1) {
    return (instance: Object): string =>
      `sequelize/${model.tableName}/${instance[primaryKeyAttributes[0]]}`
  }
  return (instance: Object): string => {
    const primaryKeys: {[key: string]: any} = {}
    primaryKeyAttributes.forEach((key: string) => primaryKeys[key] = instance[key])
    return `sequelize/${model.tableName}/${JSON.stringify(primaryKeys)}`
  }
}


