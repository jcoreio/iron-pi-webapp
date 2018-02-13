// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'
import {isEqual} from 'lodash'
import sparkplug from 'sparkplug-client'

import type {PluginConfig, TagMetadata, TagMetadataMap} from '../../universal/data-router/PluginConfigTypes'
import {validateMQTTConfig} from '../../universal/mqtt/MQTTConfig'
import type {MQTTConfig} from '../../universal/mqtt/MQTTConfig'
import {FEATURE_EVENT_DATA_PLUGIN_INSTANCES_CHANGE} from '../data-router/PluginTypes'
import type {DataPlugin, DataPluginEmittedEvents, DataPluginResources, CycleDoneEvent,
  DataPluginMapping, Feature, FeatureEmittedEvents} from '../data-router/PluginTypes'
import {metadataHandler, EVENT_METADATA_CHANGE} from '../metadata/MetadataHandler'
import type {MetadataChangeEvent} from '../metadata/MetadataHandler'

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
  mqttPluginFeature.emit(FEATURE_EVENT_DATA_PLUGIN_INSTANCES_CHANGE)
}

export default class MQTTPlugin extends EventEmitter<DataPluginEmittedEvents> implements DataPlugin {
  _config: MQTTConfig;
  _resources: DataPluginResources;

  _metadataListener: (event: MetadataChangeEvent) => void;

  _metadataToMQTT: TagMetadataMap = {}
  _tagsToMQTT: Array<string> = []

  _sparkplug: Object;

  constructor(args: {config: PluginConfig, resources: DataPluginResources}) {
    super()
    this._config = validateMQTTConfig(args.config)
    this._resources = args.resources

    this._sparkplug = sparkplug.newClient()

    this._metadataListener = (event: MetadataChangeEvent) => this._metadataChanged()
    metadataHandler.on(EVENT_METADATA_CHANGE, this._metadataListener)
  }

  config(): PluginConfig { return this._config }

  setConfig(config: PluginConfig) {
    this._config = validateMQTTConfig(config)
  }

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

  /**
   * Send a SparkPlugin NBIRTH message on connect or when metadata changes
   * @private
   */
  _publishNodeBirth() {

  }
}
