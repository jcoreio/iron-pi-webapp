// @flow

import path from 'path'
import glob from 'glob'
import promisify from 'es6-promisify'
import * as graphql from 'graphql'
import type Sequelize from 'sequelize'
import EventEmitter from '@jcoreio/typed-event-emitter'
import {defaultArgs, resolver} from 'graphql-sequelize'
import LocalIOChannel from './models/LocalIOChannel'
import LocalIODataPlugin from './LocalIODataPlugin'
import {
  LocalIOChannelState, DigitalChannelState,
  AnalogInputState, DigitalInputState, DigitalOutputState,
  DisabledLocalIOChannelState,
} from './graphql/types/LocalIOChannelState'
import createLocalIOChannelType from './graphql/types/LocalIOChannel'
import setLocalChannelRemoteControlValue from './graphql/mutation/setLocalChannelRemoteControlValue'
import updateLocalIOChannel from './graphql/mutation/updateLocalIOChannel'

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
    for (let type of [
      LocalIOChannelState, DigitalChannelState,
      AnalogInputState, DigitalInputState, DigitalOutputState,
      DisabledLocalIOChannelState,
    ]) {
      types[type.name] = type
    }
    types[LocalIOChannel.options.name.singular] = createLocalIOChannelType({attributeFieldsCache})
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
    mutationFields.setLocalChannelRemoteControlValue = setLocalChannelRemoteControlValue({plugin: this._plugin})
    mutationFields.updateLocalIOChannel = updateLocalIOChannel({types, inputTypes})
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


