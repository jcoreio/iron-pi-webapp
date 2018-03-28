// @flow

import path from 'path'
import glob from 'glob'
import promisify from 'es6-promisify'
import type Sequelize from 'sequelize'
import EventEmitter from '@jcoreio/typed-event-emitter'
import type {PubSubEngine} from 'graphql-subscriptions'
import User from '../models/User'
import Scope from '../models/Scope'
import LocalIOChannel from './models/LocalIOChannel'
import LocalIODataPlugin from './LocalIODataPlugin'
import addTypes from './graphql/types/addTypes'
import addQueryFields from './graphql/query/addQueryFields'
import addMutationFields from './graphql/mutation/addMutationFields'
import addSubscriptionFields from './graphql/subscription/addSubscriptionFields'
import type {LocalIOChannelState} from '../../universal/localio/LocalIOChannel'
import {EVENT_CHANNEL_STATES} from './LocalIODataPlugin'

import type {DataPlugin, FeatureEmittedEvents} from '../data-router/PluginTypes'
import type {ServerFeature} from '../ServerFeature'
import type SPIHandler from './SPIHandler'

type Resources = {
  getTagValue: (tag: string) => any,
  spiHandler: SPIHandler,
}

export class LocalIOFeature extends EventEmitter<FeatureEmittedEvents> {
  plugin: LocalIODataPlugin

  async getMigrations(): Promise<Array<string>> {
    return promisify(glob)(path.join(__dirname, 'migrations', '*.js'))
  }
  addSequelizeModels({sequelize}: {sequelize: Sequelize}) {
    LocalIOChannel.initAttributes({sequelize})
    LocalIOChannel.initAssociations()
  }
  async seedDatabase(): Promise<void> {
    if (process.env.BABEL_ENV === 'test') {
      const testUser = await User.findOne({where: {username: 'test'}})
      if (testUser) {
        // $FlowFixMe
        await testUser.addScopes(await Scope.findAll({
          where: {
            id: [
              'localio:setRemoteControlValues',
              'localio:test:setRawInputs',
            ]
          }
        }))
      }
    }
  }
  addTypes = addTypes(this)
  addQueryFields = addQueryFields(this)
  addMutationFields = addMutationFields(this)
  addSubscriptionFields = addSubscriptionFields(this)
  addPublications = ({pubsub}: {
    pubsub: PubSubEngine,
  }) => {
    this.plugin.on(EVENT_CHANNEL_STATES, (states: Array<LocalIOChannelState>) => {
      states.forEach((state: LocalIOChannelState) => {
        pubsub.publish(`LocalIOChannelState/${state.id}`, {LocalIOChannelState: state})
      })
      pubsub.publish(`LocalIOChannelStates`, {LocalIOChannelStates: states})
    })
  }

  async stop(): Promise<void> {
    this.plugin.removeAllListeners(EVENT_CHANNEL_STATES)
  }

  async createDataPlugins({getTagValue, spiHandler}: Resources): Promise<void> {
    this.plugin = new LocalIODataPlugin({getTagValue, spiHandler})
    await this.plugin._loadChannels()
  }
  getDataPlugins(): $ReadOnlyArray<DataPlugin> {
    return [this.plugin]
  }
}

export function createFeature(): ServerFeature {
  return new LocalIOFeature()
}


