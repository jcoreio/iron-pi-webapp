// @flow

import path from 'path'
import glob from 'glob'
import promisify from 'es6-promisify'
import * as graphql from 'graphql'
import type Sequelize from 'sequelize'
import EventEmitter from '@jcoreio/typed-event-emitter'
import {attributeFields, defaultArgs, resolver} from 'graphql-sequelize'
import LocalIOChannel from './LocalIOChannel'
import LocalIODataPlugin from './LocalIODataPlugin'

import defaultInputType from '../graphql/types/defaultInputType'
import type {Context} from '../graphql/Context'
import type {DataPlugin, FeatureEmittedEvents} from '../data-router/PluginTypes'
import type {ServerFeature} from '../ServerFeature'
import requireUserId from '../graphql/requireUserId'

export class LocalIOFeature extends EventEmitter<FeatureEmittedEvents> {
  _plugin: LocalIODataPlugin = new LocalIODataPlugin()

  async getMigrations(): Promise<Array<string>> {
    return promisify(glob)(path.join(__dirname, 'migrations', '*.js'))
  }
  addSequelizeModels({sequelize}: {sequelize: Sequelize}) {
    LocalIOChannel.initAttributes({sequelize})
    LocalIOChannel.initAssociations()
  }
  addTypes({types, inputTypes, attributeFieldsCache}: {
    types: {[name: string]: graphql.GraphQLOutputType},
    inputTypes: {[name: string]: graphql.GraphQLInputType},
    attributeFieldsCache: Object,
  }) {
    types[LocalIOChannel.name] = new graphql.GraphQLObjectType({
      name: LocalIOChannel.name,
      fields: () => ({
        ...attributeFields(LocalIOChannel, {cache: attributeFieldsCache})
      }),
    })
    inputTypes.LocalIOChannel = defaultInputType(LocalIOChannel, {cache: attributeFieldsCache})
  }
  addQueryFields({types, queryFields}: {
    types: {[name: string]: graphql.GraphQLOutputType},
    queryFields: {[name: string]: graphql.GraphQLFieldConfig<any, Context>},
  }) {
    for (let model of [LocalIOChannel]) {
      const type = types[model.name]
      if (!type) continue
      const {options} = model
      queryFields[options.name.singular] = {
        type,
        args: defaultArgs(model),
        resolve: resolver(model, {before: requireUserId}),
      }
      queryFields[options.name.plural] = {
        type: new graphql.GraphQLList(type),
        args: defaultArgs(model),
        resolve: resolver(model, {before: requireUserId}),
      }
    }
  }

  async createDataPlugins(): Promise<void> {
    await this._plugin._loadChannels()
  }
  getDataPlugins(): $ReadOnlyArray<DataPlugin> {
    return [this._plugin]
  }
}

export function createFeature(): ServerFeature {
  return new LocalIOFeature()
}


