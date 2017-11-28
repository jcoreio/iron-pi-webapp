// @flow

import Sequelize from 'sequelize'

type Options = {
  field?: string,
  jsonField?: string,
  allowNull?: boolean,
  defaultValue?: any,
  comment?: string,
}

export default function JSONField(name: string, options?: Options = {}): Object {
  const {field, comment} = options
  const allowNull = options.allowNull != null ? options.allowNull : true
  const defaultValue = options.defaultValue != null ? options.defaultValue : null
  const rawName = name + 'Json'
  const result = {
    [rawName]: {
      type: Sequelize.TEXT,
      allowNull,
      defaultValue: defaultValue == null ? null : JSON.stringify(defaultValue),
      comment: `stringified JSON for ${name} field`,
    },
    [name]: {
      type: new Sequelize.VIRTUAL(Sequelize.JSON, [rawName]),
      allowNull,
      get(): any {
        return rawName == null ? rawName : JSON.parse(this.get(rawName))
      },
      set(val: any) {
        this.setDataValue(name, val)
        this.setDataValue(rawName, val == null ? null : JSON.stringify(val))
      },
      comment,
    },
  }
  if (field) {
    result[name].field = field
    result[rawName].field = options.jsonField || field + 'Json'
  } else if (options.jsonField) {
    result[rawName].field = options.jsonField
  }
  return result
}

export function upJSONField(queryInterface: any, modelName: string, fieldName: string, options?: Options = {}): Promise<any> {
  const fields = JSONField(fieldName, options)
  const rawName = fieldName + 'Json'
  return queryInterface.addColumn(modelName, rawName, fields[rawName])
}

export function downJSONField(queryInterface: any, modelName: string, fieldName: string): Promise<any> {
  const rawName = fieldName + 'Json'
  return queryInterface.removeColumn(modelName, rawName)
}

