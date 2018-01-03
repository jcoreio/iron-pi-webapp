// @flow

import type Sequelize, {Model} from 'sequelize'
import * as graphql from 'graphql'
import {mapValues} from 'lodash'
import {associationFields} from '@jcoreio/graphql-sequelize-extra'

import {resolver, attributeFields, defaultArgs} from 'graphql-sequelize'
import Channel from '../../models/Channel'
import type {ChannelState} from '../../../universal/types/Channel'
import {getChannelState} from '../../localio/ChannelStates'
import pubsub from '../pubsub'
import User from '../../models/User'

export type Options = {
  sequelize: Sequelize,
}

export type Context = {
  userId: ?number,
  sequelize: Sequelize,
}

export default function createSchema(options: Options): graphql.GraphQLSchema {
  const {sequelize} = options
  const models = {...sequelize.models}

  const args = mapValues(models, model => defaultArgs(model))

  function getArgs(model: Class<Model<any>>): Object {
    return args[model.name]
  }

  function getType(model: Class<Model<any>>): Object {
    return types[model.name]
  }

  const ChannelStateType = new graphql.GraphQLObjectType({
    name: 'ChannelState',
    description: 'the realtime state of a channel',
    fields: {
      id: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
        description: 'the numeric id (primary key) of the channel',
      },
      value: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLFloat),
        description: 'the current value of the channel',
      },
    },
  })

  const extraFields = {
    [Channel.name]: {
      state: {
        type: ChannelStateType,
        description: 'the state of this channel',
        resolve(source: Channel): ?ChannelState {
          return getChannelState(source.id)
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
    currentUser: {
      type: types[User.name],
      resolve: async (obj: any, args: any, context: Context): Promise<any> => {
        const {userId: id} = context
        if (id) {
          const user = await User.findOne({where: {id}})
          if (user) return user.get({plain: true, raw: true})
        }
        return null
      },
    },
  }
  if (process.env.BABEL_ENV === 'test') Object.assign(queryFields, require('./testQueryFields').default(options))

  function requireUserId<F: Object>(findOptions: F, args: any, context: Context, {fieldName}: {fieldName: string}): F {
    const {userId} = context
    if (!userId) throw new graphql.GraphQLError(`You must be logged in to access ${fieldName}`)
    return findOptions
  }

  for (let name in types) {
    switch (name) {
    case User.name:
      continue
    }
    const model = models[name]
    const type = types[name]
    const {options}: { options: { name: { singular: string, plural: string } } } = (model: any)

    queryFields[options.name.singular] = {
      type,
      args: args[name],
      resolve: resolver(model, {before: requireUserId}),
    }
    queryFields[options.name.plural] = {
      type: new graphql.GraphQLList(type),
      args: args[name],
      resolve: resolver(model, {before: requireUserId}),
    }
  }

  const query = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: queryFields,
  })

  const mutationFields = {
    setUsername: {
      type: types[User.name],
      args: {
        username: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString),
        },
      },
      resolve: async (obj: any, {username}: Object, context: Context): Promise<any> => {
        const {userId: id} = context
        if (!id) throw new graphql.GraphQLError('You must be logged in to change your username')
        const [numAffected] = await User.update({username}, {where: {id}})
        if (!numAffected) throw new graphql.GraphQLError('Failed to find a user with the given id')
        return await User.findOne({where: {id}})
      }
    }
  }

  if (process.env.BABEL_ENV === 'test') Object.assign(mutationFields, require('./testMutations').default(options))

  const mutation = new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: mutationFields,
  })

  const subscription = new graphql.GraphQLObjectType({
    name: 'Subscription',
    fields: {
      ChannelStates: {
        type: new graphql.GraphQLNonNull(ChannelStateType),
        subscribe(): AsyncIterator<ChannelState> {
          return pubsub.asyncIterator('ChannelStates')
        }
      },
    }
  })

  const schemaFields = {
    query,
    mutation,
    subscription,
  }

  return new graphql.GraphQLSchema(schemaFields)
}
