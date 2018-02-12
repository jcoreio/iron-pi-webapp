// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'
import {isEqual} from 'lodash'
import sparkplug from 'sparkplug-client'

import type {PluginConfig, TagMetadata, TagMetadataMap} from '../../universal/data-router/PluginConfigTypes'
import {registerPluginType} from '../data-router/PluginsRegistry'
import type PluginResources from '../data-router/PluginResources'
import {validateMQTTConfig} from '../../universal/mqtt/MQTTConfig'
import type {MQTTConfig} from '../../universal/mqtt/MQTTConfig'
import type {DataPlugin, InputChangeEvent, CycleDoneEvent, DataPluginMapping, ValuesMap, CreatePluginArgs} from '../data-router/PluginTypes'
import {metadataHandler, EVENT_METADATA_CHANGE} from '../metadata/MetadataHandler'
import type {MetadataChangeEvent} from '../metadata/MetadataHandler'

type MQTTPluginEvents = {
  data: [ValuesMap],
}

export const PLUGIN_TYPE_MQTT = 'mqtt'

registerPluginType(PLUGIN_TYPE_MQTT, (args: CreatePluginArgs) => new MQTTPlugin(args))

export default class MQTTPlugin extends EventEmitter<MQTTPluginEvents> implements DataPlugin {
  _config: MQTTConfig;
  _resources: PluginResources;

  _metadataListener: (event: MetadataChangeEvent) => void;

  _metadataToMQTT: TagMetadataMap = {}
  _tagsToMQTT: Array<string> = []

  _sparkplug: Object;

  constructor(args: {config: PluginConfig, resources: PluginResources}) {
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

  inputsChanged(event: InputChangeEvent) { } // Respond in dispatchCycleDone

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
