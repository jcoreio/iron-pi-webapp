// @flow

import {EVENT_DEVICE_INPUT_STATES} from '@jcoreio/iron-pi-device-client'
import type IronPiDeviceClient, {DetectedDevice, DeviceInputState, DeviceInputStates, DeviceOutputState, HardwareInfo} from '@jcoreio/iron-pi-device-client'

import EventEmitter from '@jcoreio/typed-event-emitter'
import {createSelector} from 'reselect'
import {isEmpty, last, memoize} from 'lodash'
import logger from 'log4jcore'

import LocalIOChannel from './models/LocalIOChannel'
import type {DataPluginEmittedEvents, InputChangeEvent} from '../data-router/PluginTypes'
import type {PluginInfo} from '../../universal/data-router/PluginConfigTypes'
import type {LocalControlDigitalOutputConfig, Calibration, DigitalOutputConfig} from '../../universal/localio/LocalIOChannel'
import type {DataPluginMapping} from '../../universal/types/PluginTypes'
import {setCommandToTag, tagToSetCommand} from '../../universal/types/Tag'
import {DATA_PLUGIN_EVENT_IOS_CHANGED, DATA_PLUGIN_EVENT_DATA} from '../data-router/PluginTypes'
import Calibrator from '../calc/Calibrator'
import isEqual from 'lodash.isequal'
import range from 'lodash.range'
import evaluateControlLogic from '../calc/evaluateControlLogic'
import {isOutputtingATag, CONTROL_MODE_OUTPUT_A_TAG, CONTROL_MODE_CONDITION, CONTROL_MODE_FORCE_OFF, CONTROL_MODE_FORCE_ON} from '../../universal/localio/LocalIOChannel'
import type {LocalIOChannelState} from '../../universal/localio/LocalIOChannel'
import getChannelState from './getChannelState'
import * as LocalIOTags from '../../universal/localio/LocalIOTags'
import MetadataItem from '../models/MetadataItem'

const log = logger('LocalIODataPlugin')

type Options = {
  ironPiDeviceClient: IronPiDeviceClient,
  getTagValue: (tag: string) => any,
}

function digitize(value: any): 1 | 0 | null {
  if (value == null) return null
  return value ? 1 : 0
}

function applyPolarity(value: any, reversed: ?boolean): 1 | 0 | null {
  const valueDigitized = digitize(value)
  return (reversed && valueDigitized != null) ? (valueDigitized ? 0 : 1) : valueDigitized
}

export const EVENT_CHANNEL_STATES = 'channelStates'

const OUTPUT_VALUES_REFRESH_INTERVAL = 1000

type Events = {
  channelStates: [Array<LocalIOChannelState>],
} & DataPluginEmittedEvents

export default class LocalIODataPlugin extends EventEmitter<Events> {
  _ironPiDeviceClient: IronPiDeviceClient
  _getTagValue: (tag: string) => any
  _channels: Array<LocalIOChannel> = []
  _selectCalibrator: (id: number) => (channel: LocalIOChannel) => Calibrator = memoize((id: number) => createSelector(
    (channel: LocalIOChannel) => channel.config.calibration,
    (calibration: Calibration = {points: []}) => new Calibrator(calibration.points || [])
  ))

  /** tag values that have been set from another plugin, e.g. an MQTT plugin */
  _outputTagValues: Array<any> = []

  _sendOutputValuesInterval: ?IntervalID

  constructor({ironPiDeviceClient, getTagValue}: Options) {
    super()
    this._ironPiDeviceClient = ironPiDeviceClient
    this._getTagValue = getTagValue
  }

  start() {
    this._updateData()
    this._updateChannelStates()
    this._ironPiDeviceClient.on(EVENT_DEVICE_INPUT_STATES, this._handleDeviceInputStates)
    LocalIOChannel.addHook('afterUpdate', 'LocalIODataPlugin_channelUpdated', this._channelUpdated)
    if (!this._sendOutputValuesInterval)
      this._sendOutputValuesInterval = setInterval(this._sendOutputValues, OUTPUT_VALUES_REFRESH_INTERVAL)
  }

  destroy() {
    this._ironPiDeviceClient.removeListener(EVENT_DEVICE_INPUT_STATES, this._handleDeviceInputStates)
    LocalIOChannel.removeHook('afterUpdate', 'LocalIODataPlugin_channelUpdated')
    if (this._sendOutputValuesInterval) {
      clearInterval(this._sendOutputValuesInterval)
      this._sendOutputValuesInterval = undefined
    }
  }

  _channelUpdated = (channel: LocalIOChannel) => {
    const {id} = channel
    this._channels[id] = channel
    this.emit(DATA_PLUGIN_EVENT_IOS_CHANGED)
    this._updateData()
    this._updateChannelStates()
  }

  async _loadChannels(): Promise<void> {
    let totalNumChannels = 0
    const hardwareInfo: ?HardwareInfo = this._ironPiDeviceClient.hardwareInfo()
    if (hardwareInfo) {
      const lastDevice: ?DetectedDevice = last(hardwareInfo.devices)
      if (lastDevice) {
        const {ioOffset, model: {numDigitalInputs, numDigitalOutputs, numAnalogInputs}} = lastDevice
        totalNumChannels = ioOffset + Math.max(numDigitalInputs, numDigitalOutputs, numAnalogInputs)
      }
    }
    log.info(`detected ${totalNumChannels} local IO channels`)
    this._channels = await LocalIOChannel.findAll({order: [['id', 'ASC']]})
    if (this._channels.length < totalNumChannels) {
      log.info(`creating local IO channels ${this._channels.length + 1} through ${totalNumChannels}`)
      await Promise.all(range(this._channels.length, totalNumChannels).map(async (id: number): Promise<any> => {
        const tag = `channel${id + 1}`
        const item = {
          tag,
          name: `Channel ${id + 1}`,
          dataType: 'number',
          isDigital: true,
          units: 'V',
          rounding: 0.01,
          displayPrecision: 2,
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
            controlMode: CONTROL_MODE_OUTPUT_A_TAG,
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
      if (tag && channel.config.mode !== 'DISABLED') {
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
        if (CONTROL_MODE_CONDITION === controlMode) {
          const {controlLogic}: LocalControlDigitalOutputConfig = (channel.config: any)
          tagsToPlugin.push(...controlLogic.map(({tag}) => tag))
        }
        if (tag && CONTROL_MODE_CONDITION !== config.controlMode) {
          // Mark the tag settable as long as it's not being set via a condition. That way, if the
          // output is temporarily put into Force On or Force Off status, we won't get spurious
          // mapping problems
          mapping.settable = true
          tagsToPlugin.push(tagToSetCommand(tag))
        }
      }
      }
      if (tagsToPlugin.length)
        mapping.tagsToPlugin = tagsToPlugin
      mappings.push(mapping)
    }
    return mappings
  }

  //---------------------------------------------------------------------------
  // Change handlers
  //---------------------------------------------------------------------------

  inputsChanged(event: InputChangeEvent) {
    // Handle the case where an output value is being written by another plugin, like an MQTT connector
    event.changedTags.forEach((maybeCommand: string) => {
      const tagToSet = setCommandToTag(maybeCommand)
      if (tagToSet) {
        for (let channel of this._channels) {
          const {id, tag, config} = channel
          if (isOutputtingATag(config) && tag === tagToSet) {
            const timeValuePair = event.tagMap[maybeCommand]
            this._outputTagValues[id] = timeValuePair && timeValuePair.v
          }
        }
      }
    })
    this._updateData()
  }

  dispatchCycleDone() {
    this._updateChannelStates()
  }

  _handleDeviceInputStates = (deviceInputStates: DeviceInputStates) => {
    const data = {}
    for (let deviceInputState: DeviceInputState of deviceInputStates.inputStates) {
      const {ioOffset, digitalInputs, digitalOutputs, analogInputs} = deviceInputState
      analogInputs.forEach((value: number, idx: number) =>
        data[LocalIOTags.rawAnalogInput(ioOffset + idx)] = value)
      digitalInputs.forEach((value: boolean, idx: number) =>
        data[LocalIOTags.rawDigitalInput(ioOffset + idx)] = digitize(value))
      digitalOutputs.forEach((value: boolean, idx: number) =>
        data[LocalIOTags.rawOutput(ioOffset + idx)] = digitize(value))
    }
    if (!isEmpty(data))
      this.emit(DATA_PLUGIN_EVENT_DATA, data)
  }

  _updateData() {
    const data = {}
    for (let channel of this._enabledChannels()) {
      const {id, tag, config} = channel

      let controlValue = null
      let systemValue = null

      switch (config.mode) {
      case 'ANALOG_INPUT': {
        const rawAnalogInput = this._getTagValue(LocalIOTags.rawAnalogInput(id))
        const calibrator = this._selectCalibrator(id)(channel)
        systemValue = (calibrator && rawAnalogInput != null) ? calibrator.calibrate(rawAnalogInput) : null
        break
      }
      case 'DIGITAL_INPUT': {
        const {reversePolarity} = (config: any)
        const rawDigitalInput = this._getTagValue(LocalIOTags.rawDigitalInput(id))
        systemValue = applyPolarity(rawDigitalInput, reversePolarity)
        break
      }
      case 'DIGITAL_OUTPUT': {
        const {controlMode, safeState, controlLogic} = (config: any)
        switch (controlMode) {
        case CONTROL_MODE_FORCE_OFF:
          controlValue = false
          break
        case CONTROL_MODE_FORCE_ON:
          controlValue = true
          break
        case CONTROL_MODE_CONDITION:
          controlValue = evaluateControlLogic(controlLogic, {
            getChannelValue: this._getTagValue,
          })
          break
        case CONTROL_MODE_OUTPUT_A_TAG:
          controlValue = tag ? digitize(this._outputTagValues[id]) : null
          break
        }
        systemValue = digitize(controlValue != null ? controlValue : safeState)
        break
      }
      }

      data[LocalIOTags.systemValue(id)] = systemValue
      if (tag)
        data[tag] = systemValue
      if ('DIGITAL_OUTPUT' === config.mode)
        data[LocalIOTags.controlValue(id)] = controlValue
    }
    this.emit(DATA_PLUGIN_EVENT_DATA, data)
  }

  _curOutputValues: Array<boolean> = []
  _curOutputStates: Map<number, LocalIOChannelState> = new Map()

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
      if (!isEqual(state, this._curOutputStates.get(id))) {
        outputStates.push(state)
      }
      this._curOutputStates.set(id, state)
    }
    // Emit channel state changes so that they can be published to GraphQL
    if (outputStates.length) this.emit(EVENT_CHANNEL_STATES, outputStates)
    if (!isEqual(outputValues, this._curOutputValues)) {
      this._curOutputValues = outputValues
      this._sendOutputValues()
    }
  }

  _sendOutputValues = () => {
    const hardwareInfo: ?HardwareInfo = this._ironPiDeviceClient.hardwareInfo()
    if (hardwareInfo) {
      const outputs: Array<DeviceOutputState> = hardwareInfo.devices.map((detectedDevice: DetectedDevice) => {
        const {address, ioOffset, model: {numDigitalOutputs}} = detectedDevice
        return {
          address,
          levels: range(numDigitalOutputs).map((idx: number) => !!this._curOutputValues[idx + ioOffset])
        }
      })
      this._ironPiDeviceClient.setOutputs({outputs})
    }
  }

  channelSupportsAnalog(id: number): boolean {
    const hardwareInfo: ?HardwareInfo = this._ironPiDeviceClient.hardwareInfo()
    if (hardwareInfo) {
      for (const detectedDevice: DetectedDevice of hardwareInfo.devices) {
        const {ioOffset, model: {numAnalogInputs}} = detectedDevice
        if (id >= ioOffset && id < ioOffset + numAnalogInputs)
          return true
      }
    }
    return false
  }
}
