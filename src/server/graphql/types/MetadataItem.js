// @flow

import * as graphql from 'graphql'

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
    _id: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
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
  resolveType(value: any): ?graphql.GraphQLObjectType {
    if (value.dataType === 'number') {
      if (value.isDigital) return DigitalMetadataItem
      return NumericMetadataItem
    }
  },
})

export default MetadataItem

export const NumericMetadataItem = new graphql.GraphQLObjectType({
  name: 'NumericMetadataItem',
  interfaces: [MetadataItem],
  fields: {
    _id: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
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
    _id: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
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

