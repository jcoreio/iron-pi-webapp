// @flow

import * as graphql from 'graphql'

export const TagDataType = new graphql.GraphQLEnumType({
  name: 'TagDataType',
  values: {
    number: {value: 'number'},
    string: {value: 'string'},
  },
})

const MetadataItem = new graphql.GraphQLObjectType({
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
    isDigital: {
      type: graphql.GraphQLBoolean,
    },
    units: {
      type: graphql.GraphQLString,
    },
    min: {
      type: graphql.GraphQLFloat,
    },
    max: {
      type: graphql.GraphQLFloat,
    },
    rounding: {
      type: graphql.GraphQLFloat,
    },
    displayPrecision: {
      type: graphql.GraphQLInt,
    },
  }
})

export default MetadataItem

