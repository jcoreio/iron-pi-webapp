// @flow

import * as graphql from 'graphql'
import JSONType from 'graphql-type-json'

const TagState = new graphql.GraphQLObjectType({
  name: 'TagState',
  fields: {
    tag: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    t: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
    },
    v: {
      type: JSONType,
    },
  },
})

export default TagState

