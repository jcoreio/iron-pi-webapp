// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'
import {isEqual} from 'lodash'
import sparkplug from 'sparkplug-client'

import type {PluginInfo, TagMetadata, TagMetadataMap} from '../../universal/data-router/PluginConfigTypes'
import {FEATURE_EVENT_DATA_PLUGINS_CHANGE} from '../data-router/PluginTypes'
import type {DataPlugin, DataPluginEmittedEvents, DataPluginResources, CycleDoneEvent,
  DataPluginMapping, Feature, FeatureEmittedEvents} from '../data-router/PluginTypes'
import {metadataHandler, EVENT_METADATA_CHANGE} from '../metadata/MetadataHandler'
import type {MetadataChangeEvent} from '../metadata/MetadataHandler'
import {SPARKPLUG_VERSION_B_1_0} from './SparkPlugTypes'
import type {SparkPlugClient, SparkPlugDataMertic, SparkPlugPackage} from './SparkPlugTypes'

const _instances: Array<MQTTPlugin> = []

class MQTTPluginFeature extends EventEmitter<FeatureEmittedEvents> implements Feature {
  constructor() {
    super()
  }
  async createDataPlugins(): Promise<void> {
    // Read from Sequelize model and populate _instances array
  }
  getDataPlugins(): $ReadOnlyArray<DataPlugin> { return _instances }
}

export const mqttPluginFeature = new MQTTPluginFeature()

function onSequelizeInstanceAddHook() { // eslint-disable-line no-unused-vars
  mqttPluginFeature.emit(FEATURE_EVENT_DATA_PLUGINS_CHANGE)
}

type ToMQTTChannelState = {
  sentValue: any,
  curValue: any,
  txDelayed: boolean,
  txTime: number,
}

export default class MQTTPlugin extends EventEmitter<DataPluginEmittedEvents> implements DataPlugin {
  _pluginInfo: PluginInfo;
  _resources: DataPluginResources;

  _metadataListener: (event: MetadataChangeEvent) => void;

  _metadataToMQTT: TagMetadataMap = {}
  _tagsToMQTT: Array<string> = []

  _client: SparkPlugClient;

  _toMQTTChannelStates: Array<ToMQTTChannelState> = []

  constructor(args: {pluginInfo: PluginInfo, resources: DataPluginResources}) {
    super()
    this._pluginInfo = args.pluginInfo
    this._resources = args.resources

    this._client = (sparkplug: SparkPlugPackage).newClient({
      serverUrl: 'tcp://192.168.1.72:1883',
      username: 'username',
      password: 'password',
      groupId: 'testGroupId',
      edgeNode: 'testNodeId',
      clientId: 'testClientId',
      version: SPARKPLUG_VERSION_B_1_0,
    })

    this._metadataListener = (event: MetadataChangeEvent) => this._metadataChanged()
    metadataHandler.on(EVENT_METADATA_CHANGE, this._metadataListener)
  }

  pluginInfo(): PluginInfo { return this._pluginInfo }

  ioMappings(): Array<DataPluginMapping> {
    return []
  }

  dispatchCycleDone(event: CycleDoneEvent) {
    // if (event.inputsChanged) {
    //
    // }
  }

  start() {
    // Figure out tags
  }

  destroy() {
    metadataHandler.removeListener(EVENT_METADATA_CHANGE, this._metadataListener)
  }

  _metadataChanged() {
    const metadataToMQTT = this._calcMetadataToMQTT(this._resources.metadata())
    if (!isEqual(metadataToMQTT, this._metadataToMQTT)) {
      this._metadataToMQTT = metadataToMQTT
      this._publishNodeBirth()
    }
  }

  _calcMetadataToMQTT(metadata: TagMetadataMap): TagMetadataMap {
    const metadataToMQTT = {}
    this._tagsToMQTT.forEach((tag: string) => {
      const metadataForTag: ? TagMetadata = metadata[tag]
      if (metadataForTag)
        metadataToMQTT[tag] = metadataForTag
    })
    return metadataToMQTT
  }

  _generateDataMessage(opts: {sendAll?: ?boolean} = {}): Array<SparkPlugDataMertic> {
    return []
  }

  /**
   * Send a SparkPlugin NBIRTH message on connect or when metadata changes
   * @private
   */
  _publishNodeBirth() {

  }
}
