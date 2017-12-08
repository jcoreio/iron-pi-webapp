// @flow

import * as graphql from 'graphql'

import {resolver, attributeFields, defaultArgs} from 'graphql-sequelize'
import Channels from '../../models/Channels'

const channelType = new graphql.GraphQLObjectType({
  name: 'Channel',
  fields: attributeFields(Channels),
})

const query = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: {
    Channel: {
      type: channelType,
      args: {
        ...defaultArgs(Channels),
        channelId: {type: graphql.GraphQLString},
      },
      resolve: resolver(Channels),
    },
  }
})

const schema = new graphql.GraphQLSchema({query})

export default schema

