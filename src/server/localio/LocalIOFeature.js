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
import LEDHandler from './LEDHandler'
import type {LEDMessage} from './LEDHandler'
import SPIHandler from './SPIHandler'
import SPIHubClient from 'spi-hub-client'

const LED_MESSAGE_OK: LEDMessage = {
  colors: [{color: 'green', count: 2}],
  flashRate: 500,
  idleTime: 2000
}
// "App Offline" LED pattern
const LED_MESSAGE_APP_OFFLINE: LEDMessage = {
  colors: [{color: 'red', count: 2}],
  flashRate: 500,
  idleTime: 2000
}

type Resources = {
  getTagValue: (tag: string) => any,
}

export class LocalIOFeature extends EventEmitter<FeatureEmittedEvents> {
  _spiHubClient = new SPIHubClient({binary: true})
  _spiHandler = new SPIHandler(this._spiHubClient)
  _ledHandler = new LEDHandler(this._spiHubClient)
  _ledHandlerInterval: ?number
  _plugin: LocalIODataPlugin

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
    this._plugin.on(EVENT_CHANNEL_STATES, (states: Array<LocalIOChannelState>) => {
      states.forEach((state: LocalIOChannelState) => {
        pubsub.publish(`LocalIOChannelState/${state.id}`, {LocalIOChannelState: state})
      })
      pubsub.publish(`LocalIOChannelStates`, {LocalIOChannelStates: states})
    })
  }
  async start(): Promise<void> {
    if (!this._ledHandlerInterval) {
      this._ledHandlerInterval = setInterval(() => this._sendLEDStatus(), 4000)
    }
    this._sendLEDStatus()
  }

  async stop(): Promise<void> {
    this._plugin.removeAllListeners(EVENT_CHANNEL_STATES)
    if (this._ledHandlerInterval) {
      clearInterval(this._ledHandlerInterval)
      this._ledHandlerInterval = undefined
    }
  }

  _sendLEDStatus() {
    this._ledHandler.sendLEDState(LED_MESSAGE_OK, LED_MESSAGE_APP_OFFLINE)
  }

  async createDataPlugins({getTagValue}: Resources): Promise<void> {
    this._plugin = new LocalIODataPlugin({
      spiHandler: this._spiHandler,
      getTagValue,
    })
    await this._plugin._loadChannels()
  }
  getDataPlugins(): $ReadOnlyArray<DataPlugin> {
    return [this._plugin]
  }
}

export function createFeature(): ServerFeature {
  return new LocalIOFeature()
}


