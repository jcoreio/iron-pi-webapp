// @flow
/* @flow-runtime enable */

import {reify} from 'flow-runtime'
import type {Type} from 'flow-runtime'

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

export type MetadataItem = DigitalMetadataItem | NumericMetadataItem | StringMetadataItem

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

