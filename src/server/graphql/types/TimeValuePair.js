// @flow

import * as graphql from 'graphql'
import JSONType from 'graphql-type-json'

const TimeValuePair = new graphql.GraphQLObjectType({
  name: 'TimeValuePair',
  fields: {
    t: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
    },
    v: {
      type: JSONType,
    },
  },
})

export default TimeValuePair

