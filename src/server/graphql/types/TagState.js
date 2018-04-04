// @flow

import * as graphql from 'graphql'
import JSONType from 'graphql-type-json'

const TagState = new graphql.GraphQLObjectType({
  name: 'TagState',
  fields: {
    tag: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    v: {
      type: JSONType,
    },
  },
})

export default TagState

