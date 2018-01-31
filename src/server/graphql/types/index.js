// @flow

import * as graphql from 'graphql'
import type {GraphQLOutputType, GraphQLInputType} from 'graphql'
import type Sequelize, {Model} from 'sequelize'
import mapValues from 'lodash.mapvalues'
import {defaultArgs, attributeFields} from 'graphql-sequelize'
import {associationFields} from '@jcoreio/graphql-sequelize-extra'
import GraphQLJSON from 'graphql-type-json'

import type {ChannelAttributes} from '../../models/Channel'
import Channel from '../../models/Channel'
import type {ChannelState} from '../../../universal/types/Channel'
import defaultInputType from './defaultInputType'
import type {Store} from '../../redux/types'

export type Options = {
  sequelize: Sequelize,
  store: Store,
}

export default function createTypes(options: Options): {
  types: {[name: string]: GraphQLOutputType},
  inputTypes: {[name: string]: GraphQLInputType},
} {
  const {sequelize, store} = options
  const models = {...sequelize.models}

  const args = mapValues(models, model => defaultArgs(model))

  function getArgs(model: Class<Model<any>>): Object {
    return args[model.name]
  }

  function getType(model: Class<Model<any>>): Object {
    return types[model.name]
  }

  const extraFields = {
    [Channel.name]: {
      state: {
        type: GraphQLJSON,
        description: 'the state of this channel',
        resolve(source: ChannelAttributes): ?ChannelState {
          return store.getChannelState(source.channelId)
        },
      },
    },
  }

  const attributeFieldsCache = {}

  const types = mapValues(models, (model: Class<Model<any>>) => new graphql.GraphQLObjectType({
    name: model.name,
    fields: () => ({
      ...attributeFields(model, {cache: attributeFieldsCache}),
      ...associationFields(model, {getType, getArgs}),
      ...extraFields[model.name] || {},
    })
  }))

  const inputTypes = mapValues(models, model => defaultInputType(model, {cache: attributeFieldsCache}))

  return {types, inputTypes}
}
