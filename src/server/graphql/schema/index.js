// @flow

import * as graphql from 'graphql'

import {resolver, attributeFields, defaultArgs} from 'graphql-sequelize'
import Channel from '../../models/Channel'
import subscribeSequelize from '../subscribeSequelize'

const channelType = new graphql.GraphQLObjectType({
  name: 'Channel',
  fields: attributeFields(Channel),
})

function shapeOf(type: graphql.GraphQLObjectType): graphql.GraphQLObjectType {
  const fields = {...type.getFields()}
  for (let key in fields) {
    const fieldType = fields[key].type
    if (fieldType instanceof graphql.GraphQLNonNull) fields[key] = {name: fields[key].name, type: fieldType.ofType}
  }
  return new graphql.GraphQLObjectType({
    name: `${type.name}Shape`,
    fields,
  })
}

function hooksType(modelType: graphql.GraphQLObjectType): graphql.GraphQLObjectType {
  const modelTypeShape = shapeOf(modelType)
  return new graphql.GraphQLObjectType({
    name: `${modelType.name}Hooks`,
    fields: {
      create: {type: modelTypeShape},
      update: {type: modelTypeShape},
      // destroy: graphql.GraphQLNull, TODO
    }
  })
}

const query = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: {
    Channel: {
      type: channelType,
      args: {
        ...defaultArgs(Channel),
        channelId: {type: graphql.GraphQLString},
      },
      resolve: resolver(Channel),
    },
  }
})

const subscription = new graphql.GraphQLObjectType({
  name: 'Subscription',
  fields: {
    Channel: {
      type: hooksType(channelType),
      args: defaultArgs(Channel),
      resolve: obj => obj,
      subscribe: subscribeSequelize(Channel),
    },
  }
})

const schema = new graphql.GraphQLSchema({
  query,
  subscription,
})


export default schema

