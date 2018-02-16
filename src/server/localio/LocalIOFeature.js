// @flow

import path from 'path'
import glob from 'glob'
import promisify from 'es6-promisify'
import * as graphql from 'graphql'
import type Sequelize from 'sequelize'
import EventEmitter from '@jcoreio/typed-event-emitter'
import JSONType from 'graphql-type-json'
import {attributeFields, defaultArgs, resolver} from 'graphql-sequelize'
import LocalIOChannel from './LocalIOChannel'
import type {LocalIOChannelAttributes} from './LocalIOChannel'
import LocalIODataPlugin from './LocalIODataPlugin'
import type {MetadataItem} from '../../universal/types/MetadataItem'

import defaultInputType from '../graphql/types/defaultInputType'
import type {Context} from '../graphql/Context'
import type {DataPlugin, FeatureEmittedEvents} from '../data-router/PluginTypes'
import type {ServerFeature} from '../ServerFeature'
import requireUserId from '../graphql/requireUserId'
import SPIHandler from './SPIHandler'
import SPIHubClient from 'spi-hub-client'

type Resources = {
  getTagValue: (tag: string) => any,
}

export class LocalIOFeature extends EventEmitter<FeatureEmittedEvents> {
  _spiHandler = new SPIHandler(new SPIHubClient({binary: true}))
  _plugin: LocalIODataPlugin

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
    types[LocalIOChannel.options.name.singular] = new graphql.GraphQLObjectType({
      name: LocalIOChannel.options.name.singular,
      fields: () => ({
        ...attributeFields(LocalIOChannel, {cache: attributeFieldsCache}),
        metadataItem: {
          type: JSONType,
          description: 'the metadata for this channel',
          resolve: ({tag}: LocalIOChannel, args: any, {metadataHandler}: Context): ?MetadataItem => {
            if (tag) return metadataHandler.getTagMetadata(tag)
          },
        },
      }),
    })
    inputTypes.LocalIOChannel = defaultInputType(LocalIOChannel, {cache: attributeFieldsCache})
  }
  addQueryFields({types, queryFields}: {
    types: {[name: string]: graphql.GraphQLOutputType},
    queryFields: {[name: string]: graphql.GraphQLFieldConfig<any, Context>},
  }) {
    for (let model of [LocalIOChannel]) {
      const {options} = model
      const type = types[options.name.singular]
      if (!type) continue
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
  addMutationFields = ({types, inputTypes, mutationFields}: {
    types: {[name: string]: graphql.GraphQLOutputType},
    inputTypes: {[name: string]: graphql.GraphQLInputType},
    mutationFields: {[name: string]: graphql.GraphQLFieldConfig<any, Context>},
  }) => {
    mutationFields.setLocalChannelRemoteControlValue = {
      type: graphql.GraphQLBoolean,
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
          description: 'The id of the loca channel to set the remote control value of',
        },
        controlValue: {
          type: graphql.GraphQLInt,
        },
      },
      resolve: (doc: any, args: {id: number, controlValue: ?number}, context: Context): boolean => {
        const {id, controlValue} = args
        this._plugin.setRemoteControlValue(id, controlValue == null ? null : Boolean(controlValue))
        return true
      },
    }
    mutationFields.updateLocalIOChannel = {
      type: types[LocalIOChannel.name],
      args: {
        id: {
          type: graphql.GraphQLInt,
          description: 'The id of the channel to update',
        },
        where: {
          type: JSONType,
          description: 'The sequelize where options',
        },
        channel: {
          type: inputTypes[LocalIOChannel.name],
          description: 'The fields to update',
        }
      },
      resolve: async (doc: any, {id, where, channel}: {id: ?number, where: ?Object, channel: $Shape<LocalIOChannelAttributes>}, context: Context): Promise<any> => {
        const {userId} = context
        if (!userId) throw new graphql.GraphQLError('You must be logged in to update LocalIOChannels')
        if (!where) where = {id: id != null ? id : channel.id}

        const {
          createdAt, updatedAt, // eslint-disable-line no-unused-vars
          ...updates
        } = channel
        await LocalIOChannel.update(updates, {where, individualHooks: true})
        const result = await LocalIOChannel.findOne({where})
        if (!result) throw new graphql.GraphQLError('Failed to find updated LocalIOChannel')
        return result.get({plain: true, raw: true})
      },
    }
  }

  async createDataPlugins({getTagValue}: Resources): Promise<void> {
    this._plugin = new LocalIODataPlugin({spiHandler: this._spiHandler, getTagValue})
    await this._plugin._loadChannels()
  }
  getDataPlugins(): $ReadOnlyArray<DataPlugin> {
    return [this._plugin]
  }
}

export function createFeature(): ServerFeature {
  return new LocalIOFeature()
}


