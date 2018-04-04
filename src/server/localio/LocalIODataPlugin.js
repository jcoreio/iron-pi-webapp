// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'
import {createSelector} from 'reselect'
import memoize from 'lodash.memoize'
import logger from 'log4jcore'

import LocalIOChannel from './models/LocalIOChannel'
import type {DataPluginMapping, DataPluginEmittedEvents} from '../data-router/PluginTypes'
import type {PluginInfo} from '../../universal/data-router/PluginConfigTypes'
import type {LocalControlDigitalOutputConfig, Calibration, DigitalInputConfig, DigitalOutputConfig} from '../../universal/localio/LocalIOChannel'
import type {DeviceStatus} from './SPIHandler'
import {DATA_PLUGIN_EVENT_IOS_CHANGED, DATA_PLUGIN_EVENT_DATA} from '../data-router/PluginTypes'
import Calibrator from '../calc/Calibrator'
import type SPIHandler from './SPIHandler'
import {CM_NUM_IO} from './SPIDevicesInfo'
import isEqual from 'lodash.isequal'
import range from 'lodash.range'
import evaluateControlLogic from '../calc/evaluateControlLogic'
import {isRemoteControlChannel} from '../../universal/localio/LocalIOChannel'
import type {LocalIOChannelState} from '../../universal/localio/LocalIOChannel'
import getChannelState from './getChannelState'
import {SPIDevices} from './SPIDevicesInfo'
import * as LocalIOTags from '../../universal/localio/LocalIOTags'
import MetadataItem from '../models/MetadataItem'

const log = logger('LocalIODataPlugin')

type Options = {
  spiHandler: SPIHandler,
  getTagValue: (tag: string) => any,
}

function digitize(value: ?boolean): 1 | 0 | null {
  if (value == null) return null
  return value ? 1 : 0
}

export const EVENT_CHANNEL_STATES = 'channelStates'

const OUTPUT_VALUES_REFRESH_INTERVAL = 200

type Events = {
  channelStates: [Array<LocalIOChannelState>],
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
      await Promise.all(range(CM_NUM_IO).map(async (id: number): Promise<any> => {
        const tag = `local${id + 1}`
        const item = {
          tag,
          name: `Local ${id + 1}`,
          dataType: 'number',
          isDigital: true,
          units: 'V',
          displayPrecision: 2,
          storagePrecision: 2,
          min: 0,
          max: 10,
        }
        await MetadataItem.create({tag, item})
        await LocalIOChannel.create({
          id,
          tag,
          config: {
            mode: 'DIGITAL_INPUT',
            reversePolarity: false,
            controlMode: 'REMOTE_CONTROL',
            safeState: 0,
          },
        })
      }))
      this._channels = await LocalIOChannel.findAll({order: [['id', 'ASC']]})
    }
  }

  _enabledChannels(): Array<LocalIOChannel> {
    return this._channels.filter(channel => 'DISABLED' !== channel.config.mode)
  }

  pluginInfo(): PluginInfo {
    return {
      pluginType: 'localio',
      pluginId: 'localio',
      pluginName: 'Local I/O',
    }
  }

  channelSupportsAnalog(id: number): boolean {
    for (let deviceInfo of SPIDevices) {
      if (id < deviceInfo.numAnalogInputs) return true
      id -= Math.max(deviceInfo.numAnalogInputs, deviceInfo.numDigitalInputs, deviceInfo.numDigitalOutputs)
    }
    return false
  }

  ioMappings(): Array<DataPluginMapping> {
    const mappings: Array<DataPluginMapping> = []
    for (let channel of this._channels) {
      const {id, tag, config} = channel
      const {mode, controlMode} = config
      const displayNumber = id + 1
      const channelSupportsAnalog = this.channelSupportsAnalog(id)
      const tagsToPlugin: Array<string> = []
      const baseName = `Local Channel ${displayNumber}`
      const mapping: DataPluginMapping = {
        id,
        name: baseName,
      }
      if (tag && channel.config.mode !== 'DISABLED' && !isRemoteControlChannel(config)) {
        mapping.tagFromPlugin = tag
      }
      const rawAnalogInputTag = LocalIOTags.rawAnalogInput(id)
      if (channelSupportsAnalog) {
        mappings.push({
          id: rawAnalogInputTag,
          name: `${baseName} raw analog input`,
          tagFromPlugin: rawAnalogInputTag,
        })
      }
      const rawDigitalInputTag = LocalIOTags.rawDigitalInput(id)
      mappings.push({
        id: rawDigitalInputTag,
        name: `${baseName} raw digital input`,
        tagFromPlugin: rawDigitalInputTag,
      })
      const systemValueTag = LocalIOTags.systemValue(id)
      mappings.push({
        id: systemValueTag,
        name: `${baseName} system value`,
        tagFromPlugin: systemValueTag,
      })
      const rawOutputTag = LocalIOTags.rawOutput(id)
      mappings.push({
        id: rawOutputTag,
        name: `${baseName} raw output`,
        tagFromPlugin: rawOutputTag,
      })
      switch (mode) {
      case 'ANALOG_INPUT': {
        if (channelSupportsAnalog)
          tagsToPlugin.push(rawAnalogInputTag)
        else
          log.error(`channel mode set to ANALOG_INPUT on channel ${displayNumber}, which does not support analog mode`)
        break
      }
      case 'DIGITAL_INPUT': {
        tagsToPlugin.push(rawDigitalInputTag)
        break
      }
      case 'DIGITAL_OUTPUT': {
        const controlValueTag = LocalIOTags.controlValue(id)
        mappings.push({
          id: controlValueTag,
          name: `${baseName} control value`,
          tagFromPlugin: controlValueTag,
        })
        tagsToPlugin.push(controlValueTag)
        switch (controlMode) {
        case 'LOCAL_CONTROL': {
          const {controlLogic}: LocalControlDigitalOutputConfig = (channel.config: any)
          tagsToPlugin.push(...controlLogic.map(({tag}) => tag))
          break
        }
        case 'REMOTE_CONTROL': {
          if (tag)
            tagsToPlugin.push(tag)
          break
        }
        }
      }
      }
      if (tagsToPlugin.length)
        mapping.tagsToPlugin = tagsToPlugin
      mappings.push(mapping)
    }
    return mappings
  }

  setRemoteControlValue(id: number, value: ?boolean) {
    const channel = this._channels[id]
    if (!channel) throw new Error(`Unknown channel: ${id}`)
    const {config, tag} = channel
    if (config.mode !== 'DIGITAL_OUTPUT' || config.controlMode !== 'REMOTE_CONTROL') {
      throw new Error('Channel must be in remote control digital output mode to set its control value')
    }
    if (tag == null) {
      throw new Error('Could not get tag to set remote control value on')
    }
    this.emit(DATA_PLUGIN_EVENT_DATA, {[tag]: digitize(value)})
  }

  _channelUpdated = (channel: LocalIOChannel) => {
    const {id} = channel
    this._channels[id] = channel
    this.emit(DATA_PLUGIN_EVENT_IOS_CHANGED)
    this._updateData()
    this._updateChannelStates()
  }

  _handleDeviceStatus = (deviceStatus: DeviceStatus) => {
    const {analogInputLevels, digitalInputLevels, digitalOutputLevels} = deviceStatus
    const data = {}
    for (let id = 0; id < analogInputLevels.length; id++) {
      data[LocalIOTags.rawAnalogInput(id)] = analogInputLevels[id]
    }
    for (let id = 0; id < digitalInputLevels.length; id++) {
      data[LocalIOTags.rawDigitalInput(id)] = digitize(digitalInputLevels[id])
    }
    for (let id = 0; id < digitalOutputLevels.length; id++) {
      data[LocalIOTags.rawOutput(id)] = digitize(digitalOutputLevels[id])
    }
    this.emit(DATA_PLUGIN_EVENT_DATA, data)
  }

  /**
   * For testing purposes only!
   */
  _setRawInputValues = ({id, rawAnalogInput, rawDigitalInput, rawOutput}: {
    id: number,
    rawAnalogInput?: ?number,
    rawDigitalInput?: ?boolean,
    rawOutput?: ?boolean,
  }) => {
    const digitalInputLevels: Array<boolean> = []
    const digitalInputEventCounts: Array<number> = []
    const digitalOutputLevels: Array<boolean> = []
    const analogInputLevels: Array<number> = []
    for (let channel of this._channels) {
      analogInputLevels[channel.id] = this._getTagValue(LocalIOTags.rawAnalogInput(channel.id)) || 0
      digitalInputLevels[channel.id] = this._getTagValue(LocalIOTags.rawDigitalInput(channel.id)) || false
      digitalInputEventCounts[channel.id] = 0
      digitalOutputLevels[channel.id] = this._getTagValue(LocalIOTags.rawOutput(channel.id)) || false
    }
    // note: the hardware may not support null values here, but testing kind of needs to set the values
    // to null, and nulls flow through the system just fine when there's no hardware...
    if (rawAnalogInput !== undefined) analogInputLevels[id] = (rawAnalogInput: any)
    if (rawDigitalInput !== undefined) digitalInputLevels[id] = (rawDigitalInput: any)
    if (rawOutput !== undefined) digitalOutputLevels[id] = (rawOutput: any)
    this._spiHandler.emit('deviceStatus', {
      deviceId: SPIDevices[0].deviceId,
      digitalInputLevels,
      digitalInputEventCounts,
      digitalOutputLevels,
      analogInputLevels,
    })
  }

  _updateData() {
    const data = {}
    for (let channel of this._enabledChannels()) {
      const {id, tag, config} = channel
      switch (config.mode) {
      case 'ANALOG_INPUT': {
        const rawAnalogInputTag = LocalIOTags.rawAnalogInput(id)
        const systemValueTag = LocalIOTags.systemValue(id)
        const rawAnalogInput = this._getTagValue(rawAnalogInputTag)
        const calibrator = this._selectCalibrator(id)(channel)
        data[systemValueTag] = rawAnalogInput == null ? null : calibrator.calibrate(rawAnalogInput)
        if (tag) data[tag] = data[systemValueTag]
        break
      }
      case 'DIGITAL_INPUT': {
        const {reversePolarity}: DigitalInputConfig = (config: any)
        const rawDigitalInputTag = LocalIOTags.rawDigitalInput(id)
        const systemValueTag = LocalIOTags.systemValue(id)
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
        const controlValueTag = LocalIOTags.controlValue(id)
        const systemValueTag = LocalIOTags.systemValue(id)
        const {safeState}: DigitalOutputConfig = (config: any)
        let controlValue
        switch (config.controlMode) {
        case 'FORCE_OFF': {
          controlValue = false
          break
        }
        case 'FORCE_ON': {
          controlValue = true
          break
        }
        case 'LOCAL_CONTROL': {
          const {controlLogic}: LocalControlDigitalOutputConfig = (config: any)
          controlValue = evaluateControlLogic(controlLogic, {
            getChannelValue: this._getTagValue,
          })
          break
        }
        case 'REMOTE_CONTROL': {
          if (tag) {
            const tagValue = this._getTagValue(tag)
            controlValue = tagValue != null ? Boolean(tagValue) : null
          }
          break
        }
        }
        let systemValue = digitize(controlValue != null ? controlValue : Boolean(safeState))
        data[controlValueTag] = controlValue
        data[systemValueTag] = systemValue
        if (tag && !isRemoteControlChannel(config))
          data[tag] = data[systemValueTag]
        break
      }
      }
    }
    this.emit(DATA_PLUGIN_EVENT_DATA, data)
  }

  inputsChanged() {
    this._updateData()
  }

  /**
   * To be as truthful as possible, we pass the digitalOutputLevels coming directly from SPI into the
   * rawOutput internal tags.  But without any actual hardware in test mode, this doesn't happen automatically,
   * so this method mocks that process manually.
   */
  _updateRawOutputsForTest = process.env.BABEL_ENV === 'test' ? () => {
    const {_lastOutputValues} = this
    if (!_lastOutputValues) return
    const digitalInputLevels: Array<boolean> = []
    const digitalInputEventCounts: Array<number> = []
    const digitalOutputLevels: Array<boolean> = [..._lastOutputValues]
    const analogInputLevels: Array<number> = []
    for (let channel of this._channels) {
      analogInputLevels[channel.id] = this._getTagValue(LocalIOTags.rawAnalogInput(channel.id)) || 0
      digitalInputLevels[channel.id] = this._getTagValue(LocalIOTags.rawDigitalInput(channel.id)) || false
      digitalInputEventCounts[channel.id] = 0
    }
    this._spiHandler.emit('deviceStatus', {
      deviceId: SPIDevices[0].deviceId,
      digitalInputLevels,
      digitalInputEventCounts,
      digitalOutputLevels,
      analogInputLevels,
    })
  } : () => {}

  dispatchCycleDone() {
    this._updateChannelStates()
  }

  _lastOutputValues: ?Array<boolean>
  _lastOutputStates: Map<number, LocalIOChannelState> = new Map()

  _updateChannelStates() {
    const outputValues: Array<boolean> = []
    const outputStates: Array<LocalIOChannelState> = []
    for (let channel of this._channels) {
      const {id, config} = channel
      if (config.mode === 'DIGITAL_OUTPUT') {
        const {reversePolarity, safeState}: DigitalOutputConfig = (config: any)
        const systemValue = this._getTagValue(LocalIOTags.systemValue(id))
        // systemValue should already have safeState applied, but just in case...
        outputValues[id] = systemValue != null ? Boolean(systemValue) : Boolean(safeState)
        if (reversePolarity) outputValues[id] = !outputValues[id]
      } else {
        outputValues[id] = false
      }
      const state = getChannelState(channel, {getTagValue: this._getTagValue})
      if (!isEqual(state, this._lastOutputStates.get(id))) {
        outputStates.push(state)
      }
      this._lastOutputStates.set(id, state)
    }
    if (outputStates.length) this.emit(EVENT_CHANNEL_STATES, outputStates)
    this._lastOutputValues = outputValues
    this._spiHandler.sendDigitalOutputs(outputValues)
  }

  _sendOutputValuesInterval: ?number;

  start() {
    this._updateData()
    this._updateChannelStates()
    this._spiHandler.on('deviceStatus', this._handleDeviceStatus)
    this._spiHandler.start()
    LocalIOChannel.addHook('afterUpdate', 'LocalIODataPlugin_channelUpdated', this._channelUpdated)
    if (!this._sendOutputValuesInterval) {
      this._sendOutputValuesInterval = setInterval(
        () => this._spiHandler.sendDigitalOutputs(this._lastOutputValues),
        OUTPUT_VALUES_REFRESH_INTERVAL
      )
    }
  }

  destroy() {
    this._spiHandler.removeListener('deviceStatus', this._handleDeviceStatus)
    this._spiHandler.stop()
    LocalIOChannel.removeHook('afterUpdate', 'LocalIODataPlugin_channelUpdated')
    if (this._sendOutputValuesInterval) {
      clearInterval(this._sendOutputValuesInterval)
      this._sendOutputValuesInterval = undefined
    }
  }
}
