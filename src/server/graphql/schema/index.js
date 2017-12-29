// @flow

import type {Model} from 'sequelize'
import * as graphql from 'graphql'
import {mapValues} from 'lodash'
import sequelize from '../../sequelize'
import {associationFields} from '@jcoreio/graphql-sequelize-extra'

const {models} = sequelize

import {resolver, attributeFields, defaultArgs} from 'graphql-sequelize'
import Channel from '../../models/Channel'
import type {ChannelValue} from '../../../universal/types/Channel'
import {getChannelValue, getChannelValuesArray} from '../../localio/ChannelValues'

const args = mapValues(models, model => defaultArgs(model))

function getArgs(model: Class<Model<any>>): Object {
  return args[model.name]
}

function getType(model: Class<Model<any>>): Object {
  return types[model.name]
}
const ChannelValueType = new graphql.GraphQLObjectType({
  name: 'ChannelValue',
  fields: {
    id: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
      description: 'the numeric id (primary key) of the channel',
    },
    current: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLFloat),
      description: 'the current value of the channel',
    },
  },
})

const extraFields = {
  [Channel.name]: {
    value: {
      type: ChannelValueType,
      description: 'the value of this channel',
      resolve(source: Channel): ?ChannelValue {
        return getChannelValue(source.id)
      },
    },
  },
}

const types = mapValues(models, (model: Class<Model<any>>) => new graphql.GraphQLObjectType({
  name: model.name,
  fields: () => ({
    ...attributeFields(model),
    ...associationFields(model, {getType, getArgs}),
    ...extraFields[model.name] || {},
  })
}))

const queryFields = {
  ChannelValues: {
    type: new graphql.GraphQLList(ChannelValueType),
    description: 'gets all channel values',
    resolve(): Array<ChannelValue> {
      return getChannelValuesArray()
    }
  },
}
for (let name in types) {
  const model = models[name]
  const type = types[name]
  const {options}: {options: {name: {singular: string, plural: string}}} = (model: any)

  queryFields[options.name.singular] = {
    type,
    args: args[name],
    resolve: resolver(model),
  }
  queryFields[options.name.plural] = {
    type: new graphql.GraphQLList(type),
    args: args[name],
    resolve: resolver(model),
  }
}

const query = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: queryFields,
})

const subscription = new graphql.GraphQLObjectType({
  name: 'Subscription',
  fields: {
    // delete this once you've added real subscription fields.
    hello: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      async * subscribe(): AsyncIterator<string> {
        yield 'hello'
      }
    }
  }
})

const schemaFields = {
  query,
  subscription,
}

const schema = new graphql.GraphQLSchema(schemaFields)

export default schema

