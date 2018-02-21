// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'
import {createSelector} from 'reselect'
import memoize from 'lodash.memoize'

import LocalIOChannel from './models/LocalIOChannel'
import type {DataPluginMapping, DataPluginEmittedEvents} from '../data-router/PluginTypes'
import type {PluginInfo} from '../../universal/data-router/PluginConfigTypes'
import type {LocalControlDigitalOutputConfig, Calibration, DigitalInputConfig, DigitalOutputConfig} from '../../universal/localio/LocalIOChannel'
import type {DeviceStatus} from './SPIHandler'
import {DATA_PLUGIN_EVENT_IOS_CHANGED, DATA_PLUGIN_EVENT_DATA} from '../data-router/PluginTypes'
import {INTERNAL} from '../../universal/types/Tag'
import Calibrator from '../calc/Calibrator'
import type SPIHandler from './SPIHandler'
import {CM_NUM_IO} from './SPIDevicesInfo'
import range from 'lodash.range'
import evaluateControlLogic from '../calc/evaluateControlLogic'
import type {LocalIOChannelState} from '../../universal/localio/LocalIOChannel'
import getChannelState from './getChannelState'

type Options = {
  spiHandler: SPIHandler,
  getTagValue: (tag: string) => any,
}

function digitize(value: ?boolean): 1 | 0 | null {
  if (value == null) return null
  return value ? 1 : 0
}

export const EVENT_CHANNEL_STATES = 'channelStates'

type Events = {
  channelStates: [Array<{id: number, state: LocalIOChannelState}>],
} & DataPluginEmittedEvents

export default class LocalIODataPlugin extends EventEmitter<Events> {
  _spiHandler: SPIHandler
  _getTagValue: (tag: string) => any
  _channels: Array<LocalIOChannel> = []
  _selectCalibrator: (id: number) => (channel: LocalIOChannel) => Calibrator = memoize((id: number) => createSelector(
    (channel: LocalIOChannel) => channel.config.calibration,
    (calibration: Calibration = {points: []}) => new Calibrator(calibration.points || [])
  ))

  constructor({spiHandler, getTagValue}: Options) {
    super()
    this._spiHandler = spiHandler
    this._getTagValue = getTagValue
  }

  async _loadChannels(): Promise<void> {
    this._channels = await LocalIOChannel.findAll({order: [['id', 'ASC']]})
    if (!this._channels.length) {
      await Promise.all(range(CM_NUM_IO).map(id => LocalIOChannel.create({id})))
      this._channels = await LocalIOChannel.findAll({order: [['id', 'ASC']]})
    }
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
        const rawAnalogInputTag = `${INTERNAL}localio/${id}/rawAnalogInput`
        mappings.push({
          id: rawAnalogInputTag,
          name: `Local Channel ${id} raw analog input`,
          tagFromPlugin: rawAnalogInputTag,
        })
        const systemValueTag = `${INTERNAL}localio/${id}/systemValue`
        mappings.push({
          id: systemValueTag,
          name: `Local Channel ${id} system value`,
          tagFromPlugin: systemValueTag,
        })
        mapping.tagsToPlugin = [rawAnalogInputTag]
        break
      }
      case 'DIGITAL_INPUT': {
        const rawDigitalInputTag = `${INTERNAL}localio/${id}/rawDigitalInput`
        mappings.push({
          id: rawDigitalInputTag,
          name: `Local Channel ${id} raw digital input`,
          tagFromPlugin: rawDigitalInputTag,
        })
        const systemValueTag = `${INTERNAL}localio/${id}/systemValue`
        mappings.push({
          id: systemValueTag,
          name: `Local Channel ${id} system value`,
          tagFromPlugin: systemValueTag,
        })
        mapping.tagsToPlugin = [rawDigitalInputTag]
        break
      }
      case 'DIGITAL_OUTPUT': {
        const controlValueTag = `${INTERNAL}localio/${id}/controlValue`
        mappings.push({
          id: controlValueTag,
          name: `Local Channel ${id} control value`,
          tagFromPlugin: controlValueTag,
        })
        const systemValueTag = `${INTERNAL}localio/${id}/systemValue`
        mappings.push({
          id: systemValueTag,
          name: `Local Channel ${id} system value`,
          tagFromPlugin: systemValueTag,
        })
        const rawOutputTag = `${INTERNAL}localio/${id}/rawOutput`
        mappings.push({
          id: rawOutputTag,
          name: `Local Channel ${id} raw output`,
          tagFromPlugin: rawOutputTag,
        })
        const tagsToPlugin = mapping.tagsToPlugin = [controlValueTag]
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
    const channel = this._channels[id]
    if (!channel) throw new Error(`Unknown channel: ${id}`)
    const {config} = channel
    if (config.mode !== 'DIGITAL_OUTPUT' || config.controlMode !== 'REMOTE_CONTROL') {
      throw new Error('Channel must be in remote control digital output mode to set its control value')
    }
    this.emit(DATA_PLUGIN_EVENT_DATA, {[`${INTERNAL}localio/${id}/controlValue`]: digitize(value)})
  }

  _channelUpdated = (channel: LocalIOChannel) => {
    const {id} = channel
    this._channels[id] = channel
    this.emit(DATA_PLUGIN_EVENT_IOS_CHANGED)
    this._updateData()
    const state = getChannelState(channel, {getTagValue: this._getTagValue})
    this.emit(EVENT_CHANNEL_STATES, [{id, state}])
  }

  _handleDeviceStatus = (deviceStatus: DeviceStatus) => {
    const {analogInputLevels, digitalInputLevels} = deviceStatus
    const data = {}
    for (let id = 0; id < analogInputLevels.length; id++) {
      data[`${INTERNAL}localio/${id}/rawAnalogInput`] = analogInputLevels[id]
    }
    for (let id = 0; id < digitalInputLevels.length; id++) {
      data[`${INTERNAL}localio/${id}/rawDigitalInput`] = digitize(digitalInputLevels[id])
    }
    this.emit(DATA_PLUGIN_EVENT_DATA, data)
  }

  _updateData() {
    const data = {}
    for (let channel of this._channels) {
      const {id, tag, config} = channel
      switch (config.mode) {
      case 'ANALOG_INPUT': {
        const rawAnalogInputTag = `${INTERNAL}localio/${id}/rawAnalogInput`
        const systemValueTag = `${INTERNAL}localio/${id}/systemValue`
        const rawAnalogInput = this._getTagValue(rawAnalogInputTag)
        const calibrator = this._selectCalibrator(id)(channel)
        data[systemValueTag] = rawAnalogInput == null ? null : calibrator.calibrate(rawAnalogInput)
        if (tag) data[tag] = data[systemValueTag]
        break
      }
      case 'DIGITAL_INPUT': {
        const {reversePolarity}: DigitalInputConfig = (config: any)
        const rawDigitalInputTag = `${INTERNAL}localio/${id}/rawDigitalInput`
        const systemValueTag = `${INTERNAL}localio/${id}/systemValue`
        const rawDigitalInput = this._getTagValue(rawDigitalInputTag)
        if (reversePolarity && rawDigitalInput != null) {
          data[systemValueTag] = rawDigitalInput ? 0 : 1
        } else {
          data[systemValueTag] = rawDigitalInput
        }
        if (tag) data[tag] = data[systemValueTag]
        break
      }
      case 'DIGITAL_OUTPUT': {
        const controlValueTag = `${INTERNAL}localio/${id}/controlValue`
        const systemValueTag = `${INTERNAL}localio/${id}/systemValue`
        const rawOutputTag = `${INTERNAL}localio/${id}/rawOutput`
        const {reversePolarity, safeState}: DigitalOutputConfig = (config: any)
        let controlValue
        switch (config.controlMode) {
        case 'FORCE_OFF': {
          controlValue = data[controlValueTag] = false
          break
        }
        case 'FORCE_ON': {
          controlValue = data[controlValueTag] = true
          break
        }
        case 'LOCAL_CONTROL': {
          const {controlLogic}: LocalControlDigitalOutputConfig = (config: any)
          controlValue = data[controlValueTag] = evaluateControlLogic(controlLogic, {
            getChannelValue: this._getTagValue,
          })
          break
        }
        case 'REMOTE_CONTROL': {
          controlValue = this._getTagValue(controlValueTag)
          break
        }
        }
        const systemValue = controlValue != null ? controlValue : Boolean(safeState)
        const rawOutput = reversePolarity ? !systemValue : systemValue
        data[systemValueTag] = digitize(systemValue)
        data[rawOutputTag] = digitize(rawOutput)
        if (tag) data[tag] = data[systemValueTag]
        break
      }
      }
    }
    this.emit(DATA_PLUGIN_EVENT_DATA, data)
  }

  inputsChanged() {
    this._updateData()
  }

  dispatchCycleDone() {
    const outputValues: Array<boolean> = []
    const states: Array<{id: number, state: LocalIOChannelState}> = []
    for (let channel of this._channels) {
      const {id, config} = channel
      if (config.mode === 'DIGITAL_OUTPUT') {
        const {reversePolarity, safeState}: DigitalOutputConfig = (config: any)
        const controlValue = this._getTagValue(`${INTERNAL}localio/${id}/controlValue`)
        outputValues[id] = controlValue != null ? Boolean(controlValue) : Boolean(safeState)
        if (reversePolarity) outputValues[id] = !outputValues[id]
      } else {
        outputValues[id] = false
      }
      const state = getChannelState(channel, {getTagValue: this._getTagValue})
      states.push({id, state})
    }
    this._spiHandler.sendDigitalOutputs(outputValues)
    this.emit(EVENT_CHANNEL_STATES, states)
  }

  start() {
    this._updateData()
    this._spiHandler.on('deviceStatus', this._handleDeviceStatus)
    this._spiHandler.start()
    LocalIOChannel.addHook('afterUpdate', 'LocalIODataPlugin_channelUpdated', this._channelUpdated)
  }
  destroy() {
    this._spiHandler.removeListener('deviceStatus', this._handleDeviceStatus)
    this._spiHandler.stop()
    LocalIOChannel.removeHook('afterUpdate', 'LocalIODataPlugin_channelUpdated')
  }
}

