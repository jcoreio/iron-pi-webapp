// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'
import {createSelector} from 'reselect'
import memoize from 'lodash.memoize'

import LocalIOChannel from './LocalIOChannel'
import type {DataPluginMapping, DataPluginEmittedEvents, InputChangeEvent, CycleDoneEvent} from '../data-router/PluginTypes'
import type {PluginInfo} from '../../universal/data-router/PluginConfigTypes'
import type {LocalControlDigitalOutputConfig, Calibration, DigitalInputConfig, DigitalOutputConfig} from '../../universal/localio/LocalIOChannel'
import type {DeviceStatus} from './SPIHandler'
import {DATA_PLUGIN_EVENT_IOS_CHANGED} from '../data-router/PluginTypes'
import {INTERNAL} from '../../universal/types/Tag'
import Calibrator from '../calc/Calibrator'
import type SPIHandler from './SPIHandler'

type Options = {
  spiHandler: SPIHandler,
}

function digitize(value: ?boolean): 1 | 0 | null {
  if (value == null) return null
  return value ? 1 : 0
}

export default class LocalIODataPlugin extends EventEmitter<DataPluginEmittedEvents> {
  _spiHandler: SPIHandler
  _channels: Array<LocalIOChannel> = []
  _selectCalibrator: (id: number) => (channel: LocalIOChannel) => Calibrator = memoize((id: number) => createSelector(
    (channel: LocalIOChannel) => channel.config.calibration,
    (calibration: Calibration = {points: []}) => new Calibrator(calibration.points || [])
  ))

  constructor({spiHandler}: Options) {
    super()
    this._spiHandler = spiHandler
  }

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
    const mappings: Array<DataPluginMapping> = []
    for (let channel of this._channels) {
      const {id, tag, config: {mode, controlMode}} = channel
      const mapping: DataPluginMapping = {
        id: `localio/${id}`,
        name: `Local Channel ${id}`,
      }
      if (tag) mapping.tagFromPlugin = tag
      switch (mode) {
      case 'ANALOG_INPUT': {
        mapping.tagsToPlugin = [`${INTERNAL}/localio/${id}/rawAnalogInput`]
        break
      }
      case 'DIGITAL_INPUT': {
        mapping.tagsToPlugin = [`${INTERNAL}/localio/${id}/rawDigitalInput`]
        break
      }
      case 'DIGITAL_OUTPUT': {
        const tagsToPlugin = mapping.tagsToPlugin = [`${INTERNAL}/localio/${id}/controlValue`]
        if (controlMode === 'LOCAL_CONTROL') {
          const {controlLogic}: LocalControlDigitalOutputConfig = (channel.config: any)
          tagsToPlugin.push(...controlLogic.map(({tag}) => tag))
        }
        break
      }
      }
      mappings.push(mapping)
    }
    return mappings
  }

  setRemoteControlValue(id: number, value: ?boolean) {
    this.emit('data', {[`${INTERNAL}/localio/${id}/controlValue`]: digitize(value)})
  }

  _channelUpdated = (channel: LocalIOChannel) => {
    this._channels[channel.id] = channel
    this.emit(DATA_PLUGIN_EVENT_IOS_CHANGED)
  }

  _handleDeviceStatus = (deviceStatus: DeviceStatus) => {
    const {analogInputLevels, digitalInputLevels} = deviceStatus
    const data = {}
    for (let id = 0; id < analogInputLevels.length; id++) {
      data[`${INTERNAL}/localio/${id}/rawAnalogInput`] = analogInputLevels[id]
    }
    for (let id = 0; id < digitalInputLevels.length; id++) {
      data[`${INTERNAL}/localio/${id}/rawDigitalInput`] = digitize(digitalInputLevels[id])
    }
    this.emit('data', data)
  }

  inputsChanged(event: InputChangeEvent) {
    const data = {}
    const {tagMap, changedTags} = event
    for (let channel of this._channels) {
      const {id, tag, config} = channel
      switch (config.mode) {
      case 'ANALOG_INPUT': {
        const rawAnalogInputTag = `${INTERNAL}/localio/${id}/rawAnalogInput`
        if (tag != null && changedTags.has(rawAnalogInputTag)) {
          const entry = tagMap[rawAnalogInputTag]
          const rawAnalogInput = entry ? entry.v : null
          const calibrator = this._selectCalibrator(id)(channel)
          data[tag] = calibrator.calibrate(rawAnalogInput)
        }
        break
      }
      case 'DIGITAL_INPUT': {
        const {reversePolarity}: DigitalInputConfig = (config: any)
        const rawDigitalInputTag = `${INTERNAL}/localio/${id}/rawDigitalInput`
        if (tag != null && changedTags.has(rawDigitalInputTag)) {
          const entry = tagMap[rawDigitalInputTag]
          const rawDigitalInput = entry ? entry.v : null
          if (reversePolarity && rawDigitalInput != null) {
            data[tag] = rawDigitalInput ? 0 : 1
          } else {
            data[tag] = rawDigitalInput
          }
        }
        break
      }
      case 'DIGITAL_OUTPUT': {
        if (config.controlMode === 'LOCAL_CONTROL') {

        } else {

        }
        break
      }
      }
    }
    this.emit('data', data)
  }

  dispatchCycleDone(event: CycleDoneEvent) {
  }

  start() {
    this._spiHandler.on('deviceStatus', this._handleDeviceStatus)
    this._spiHandler.start()
    LocalIOChannel.addHook('afterUpdate', 'channelUpdated', this._channelUpdated)
  }
  destroy() {
    this._spiHandler.removeListener('deviceStatus', this._handleDeviceStatus)
    this._spiHandler.stop()
    LocalIOChannel.removeHook('afterUpdate', 'channelUpdated')
  }
}

