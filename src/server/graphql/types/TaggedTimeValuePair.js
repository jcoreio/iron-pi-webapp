// @flow

import * as graphql from 'graphql'
import JSONType from 'graphql-type-json'

const TaggedTimeValuePair = new graphql.GraphQLObjectType({
  name: 'TaggedTimeValuePair',
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

export default TaggedTimeValuePair

