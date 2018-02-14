// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'
import LocalIOChannel from './LocalIOChannel'
import type {DataPluginMapping, DataPluginEmittedEvents} from '../data-router/PluginTypes'
import type {PluginInfo} from '../../universal/data-router/PluginConfigTypes'
import type {LocalControlDigitalOutputConfig} from '../../universal/localio/LocalIOChannel'
import {DATA_PLUGIN_EVENT_IOS_CHANGED} from '../data-router/PluginTypes'

export default class LocalIODataPlugin extends EventEmitter<DataPluginEmittedEvents> {
  _channels: Array<LocalIOChannel> = []

  async _loadChannels(): Promise<void> {
    this._channels = await LocalIOChannel.findAll({order: [['id', 'ASC']]})
  }

  pluginInfo(): PluginInfo {
    return {
      pluginType: 'localio',
      pluginId: 'localio',
      pluginName: 'Local I/O',
    }
  }

  ioMappings(): Array<DataPluginMapping> {
    return this._channels.map((channel: LocalIOChannel): DataPluginMapping => {
      const {id, tag, config: {mode, controlMode}} = channel
      const mapping: DataPluginMapping = {
        id: `localio/${id}`,
        name: `Local Channel ${id}`,
        tagFromPlugin: `localio/${tag}`,
      }
      if (mode === 'DIGITAL_OUTPUT' && controlMode === 'LOCAL_CONTROL') {
        const {controlLogic}: LocalControlDigitalOutputConfig = (channel.config: any)
        mapping.tagsToPlugin = controlLogic.map(({channelId}) => channelId)
      }
      return mapping
    })
  }

  _channelUpdated = (channel: LocalIOChannel) => {
    this._channels[channel.id] = channel
    this.emit(DATA_PLUGIN_EVENT_IOS_CHANGED)
  }

  start() {
    LocalIOChannel.addHook('afterUpdate', 'channelUpdated', this._channelUpdated)
  }
  destroy() {
    LocalIOChannel.removeHook('afterUpdate', 'channelUpdated')
  }
}

