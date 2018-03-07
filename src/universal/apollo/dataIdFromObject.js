// @flow

import {defaultDataIdFromObject} from 'apollo-cache-inmemory'

export default function dataIdFromObject(object: Object): number | string {
  switch (object.__typename) {
  case 'MetadataItem':
  case 'StringMetadataItem':
  case 'DigitalMetadataItem':
  case 'NumericMetadataItem':
    return `${object.__typename}:${object.tag}`
  default: return defaultDataIdFromObject(object)
  }
}
