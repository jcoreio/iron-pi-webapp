// @flow

import * as graphql from 'graphql'

import {TagDataType} from './MetadataItem'

const InputMetadataItem = new graphql.GraphQLInputObjectType({
  name: 'InputMetadataItem',
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
  },
})

export default InputMetadataItem

