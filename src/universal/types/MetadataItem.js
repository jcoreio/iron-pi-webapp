// @flow

import {reify} from 'flow-runtime'
import type {Type} from 'flow-runtime'

export type DigitalMetadataItem = {
  tag: string,
  name: string,
  dataType: 'number',
  isDigital: true,
}

export const DigitalMetadataItemType = (reify: Type<DigitalMetadataItem>)

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

export type MetadataItem = DigitalMetadataItem | NumericMetadataItem

export const MetadataItemType = (reify: Type<MetadataItem>)

