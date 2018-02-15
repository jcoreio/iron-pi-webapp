// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'
import {createSelector} from 'reselect'

import LocalIOChannel from './LocalIOChannel'
import type {DataPluginMapping, DataPluginEmittedEvents, InputChangeEvent, CycleDoneEvent} from '../data-router/PluginTypes'
import type {PluginInfo} from '../../universal/data-router/PluginConfigTypes'
import type {LocalControlDigitalOutputConfig, Calibration, DigitalInputConfig} from '../../universal/localio/LocalIOChannel'
import type {DeviceStatus} from './SPIHandler'
import {DATA_PLUGIN_EVENT_IOS_CHANGED} from '../data-router/PluginTypes'
import {INTERNAL} from '../../universal/types/Tag'
import Calibrator from '../calc/Calibrator'

export default class LocalIODataPlugin extends EventEmitter<DataPluginEmittedEvents> {
  _channels: Array<LocalIOChannel> = []
  _selectCalibrator: (channel: LocalIOChannel) => Calibrator = createSelector(
    (channel: LocalIOChannel) => channel.config.calibration,
    (calibration: Calibration = {points: []}) => new Calibrator(calibration.points || [])
  )

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
        mapping.tagsToPlugin = controlLogic.map(({tag}) => tag)
      }
      return mapping
    })
  }

  handleDeviceStatus(deviceStatus: DeviceStatus) {
    const {analogInputLevels, digitalInputLevels, digitalOutputLevels} = deviceStatus
    const data = {}
    for (let id = 0; id < analogInputLevels.length; id++) {
      data[`${INTERNAL}/${id}/rawAnalogInput`] = analogInputLevels[id]
    }
    for (let id = 0; id < digitalInputLevels.length; id++) {
      data[`${INTERNAL}/${id}/rawDigitalInput`] = digitalInputLevels[id] ? 1 : 0
    }
    for (let id = 0; id < digitalOutputLevels.length; id++) {
      data[`${INTERNAL}/${id}/rawOutput`] = digitalOutputLevels[id] ? 1 : 0
    }
    for (let id = 0; id < this._channels.length; id++) {
      const channel = this._channels[id]
      const {tag, config} = channel
      switch (config.mode) {
      case 'ANALOG_INPUT': {
        const calibrator = this._selectCalibrator(channel)
        data[tag] = calibrator.calibrate(analogInputLevels[id])
        break
      }
      case 'DIGITAL_INPUT': {
        const {reversePolarity}: DigitalInputConfig = (config: any)
        const rawInput = digitalInputLevels[id]
        data[tag] = rawInput !== reversePolarity ? 1 : 0
        break
      }
      }
    }
    this.emit('data', data)
  }

  _channelUpdated = (channel: LocalIOChannel) => {
    this._channels[channel.id] = channel
    this.emit(DATA_PLUGIN_EVENT_IOS_CHANGED)
  }

  inputsChanged(event: InputChangeEvent) {
    // TODO update digital output tags
  }
  dispatchCycleDone(event: CycleDoneEvent) {
    for (let id = 0; id < this._channels.length; id++) {
      const channel = this._channels[id]
      const {config} = channel
      if (config.mode === 'DIGITAL_OUTPUT' && config.controlMode === 'LOCAL_CONTROL') {
      }
    }
  }

  start() {
    LocalIOChannel.addHook('afterUpdate', 'channelUpdated', this._channelUpdated)
  }
  destroy() {
    LocalIOChannel.removeHook('afterUpdate', 'channelUpdated')
  }
}

