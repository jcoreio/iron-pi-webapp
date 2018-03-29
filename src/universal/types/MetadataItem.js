// @flow
/* @flow-runtime enable */

import {reify, validate} from 'flow-runtime'
import type {Type, Validation} from 'flow-runtime'

export type DataType = 'number' | 'string'

export const DataTypes = {
  number: {displayText: 'Number'},
  string: {displayText: 'String'},
}

export type DigitalMetadataItem = {
  tag: string,
  name: string,
  dataType: 'number',
  isDigital: true,
}

export const DigitalMetadataItemType = (reify: Type<DigitalMetadataItem>)

export type StringMetadataItem = {
  tag: string,
  name: string,
  dataType: 'string',
}

export const StringMetadataItemType = (reify: Type<StringMetadataItem>)

export type NumericMetadataItem = {
  tag: string,
  name: string,
  dataType: 'number',
  isDigital?: false,
  units: string,
  min: number,
  max: number,
  displayPrecision: number,
  storagePrecision: number,
}

export const NumericMetadataItemType = (reify: Type<NumericMetadataItem>)

export type MetadataItem = {
  tag: string,
  name: string,
  dataType: DataType,
  isDigital?: ?boolean,
  units?: ?string,
  min?: ?number,
  max?: ?number,
  displayPrecision?: ?number,
  storagePrecision?: ?number,
}

export const MetadataItemType = (reify: Type<MetadataItem>)

export function getMetadataItemSubtype(item: MetadataItem): Type<DigitalMetadataItem> |
  Type<StringMetadataItem> |
  Type<NumericMetadataItem> {
  switch (item.dataType) {
  case 'number': return item.isDigital ? DigitalMetadataItemType : NumericMetadataItemType
  case 'string': return StringMetadataItemType
  default: throw new Error(`unknown dataType: ${item.dataType}`)
  }
}

export function validateMetadataItem(item: MetadataItem): Validation {
  const result: Validation = validate(getMetadataItemSubtype(item), item)
  if (item.min != null && item.max != null && item.min >= item.max) {
    result.errors.push([['min'], 'must be < max'])
    result.errors.push([['max'], 'must be > min'])
  }
  return result
}

