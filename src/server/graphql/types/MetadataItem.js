// @flow

import * as graphql from 'graphql'
import type {MetadataItem as FlowMetadataItem} from '../../../universal/types/MetadataItem'
import {
  getMetadataItemSubtype, DigitalMetadataItemType, NumericMetadataItemType, StringMetadataItemType,
} from '../../../universal/types/MetadataItem'

export const TagDataType = new graphql.GraphQLEnumType({
  name: 'TagDataType',
  values: {
    number: {value: 'number'},
    string: {value: 'string'},
  },
})

const MetadataItem = new graphql.GraphQLInterfaceType({
  name: 'MetadataItem',
  fields: {
    tag: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    name: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    dataType: {
      type: new graphql.GraphQLNonNull(TagDataType),
    },
  },
  resolveType(value: FlowMetadataItem): ?graphql.GraphQLObjectType {
    switch (getMetadataItemSubtype(value)) {
    case DigitalMetadataItemType: return DigitalMetadataItem
    case NumericMetadataItemType: return NumericMetadataItem
    case StringMetadataItemType: return StringMetadataItem
    default: throw new Error('unrecognized metadata item type')
    }
  },
})

export default MetadataItem

export const NumericMetadataItem = new graphql.GraphQLObjectType({
  name: 'NumericMetadataItem',
  interfaces: [MetadataItem],
  fields: {
    tag: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    name: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    dataType: {
      type: new graphql.GraphQLNonNull(TagDataType),
    },
    units: {
      type: graphql.GraphQLString,
    },
    min: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLFloat),
    },
    max: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLFloat),
    },
    storagePrecision: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
    },
    displayPrecision: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
    },
  },
})

export const DigitalMetadataItem = new graphql.GraphQLObjectType({
  name: 'DigitalMetadataItem',
  interfaces: [MetadataItem],
  fields: {
    tag: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    name: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    dataType: {
      type: new graphql.GraphQLNonNull(TagDataType),
    },
    isDigital: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean),
    },
  },
})

export const StringMetadataItem = new graphql.GraphQLObjectType({
  name: 'StringMetadataItem',
  interfaces: [MetadataItem],
  fields: {
    tag: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    name: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    dataType: {
      type: new graphql.GraphQLNonNull(TagDataType),
    },
  },
})


