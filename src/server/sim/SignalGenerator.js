
import {isFinite} from 'lodash'
import EventEmitter from '@jcoreio/typed-event-emitter'
import {DATA_PLUGIN_EVENT_DATA} from '../data-router/PluginTypes'
import type {
  DataPlugin, DataPluginEmittedEvents, ValuesMap} from '../data-router/PluginTypes'
import type {PluginInfo} from '../../universal/data-router/PluginConfigTypes'
import type {DataPluginMapping} from '../../universal/types/PluginTypes'

const START_VALUE_DEFAULT = 0
const END_VALUE_DEFAULT = 100
const TIME_DEFAULT = 1000 * 60
const INTERVAL_DEFAULT = 100

export type SignalGeneratorChannelConfig = {
  tag: string,
  startValue?: ?number,
  endValue?: ?number,
  time?: ?number,
  offset?: ?number
}

export type SignalGeneratorConfig = {
  channels: Array<SignalGeneratorChannelConfig>,
  interval?: ?number
}

type ChannelState = {
  config: SignalGeneratorChannelConfig,
  beginTime: number
}

export default class SignalGenerator extends EventEmitter<DataPluginEmittedEvents> implements DataPlugin {
  _pluginInfo: PluginInfo;
  _config: SignalGeneratorConfig;
  _channelsStates: Array<ChannelState>;

  _interval: ?number;

  constructor(args: {pluginInfo: PluginInfo, config: SignalGeneratorConfig}) {
    super()
    this._pluginInfo = args.pluginInfo
    this._config = args.config
    this._channelsStates = args.config.channels.map((config: SignalGeneratorChannelConfig) => ({
      config,
      beginTime: 0
    }))
  }

  pluginInfo(): PluginInfo { return this._pluginInfo }

  ioMappings(): Array<DataPluginMapping> {
    // Note: In the case where "publish all public tags" is checked, we deliberately don't include
    // those tags as inputs here for two reasons: we don't know what those tags are until all other
    // plugins have been created and declared their ioMappings, and we don't need to verify that
    // those tags are populated.
    return this._config.channels.map((channelConfig: SignalGeneratorChannelConfig, channelIdx: number) => ({
      id: `channel${channelIdx + 1}`,
      name: `Channel ${channelIdx + 1}`,
      tagFromPlugin: channelConfig.tag
    }))
  }

  start() {
    if (!this._interval) {
      const now = Date.now()
      this._channelsStates.forEach((channelState: ChannelState) => channelState.beginTime = now)
      this._interval = setInterval(() => this._sendUpdates(), this._config.interval || INTERVAL_DEFAULT)
    }
  }

  _sendUpdates() {
    const now = Date.now()
    const dataMap: ValuesMap = {}
    this._channelsStates.forEach((channelState: ChannelState) => {
      const config: SignalGeneratorChannelConfig = channelState.config
      const intervalTime = isFinite(config.time) && config.time > 0 ? config.time : TIME_DEFAULT

      let timeSinceBegin = now - channelState.beginTime
      if (timeSinceBegin > intervalTime || timeSinceBegin < 0) {
        timeSinceBegin = 0
        channelState.beginTime = now
      }

      let timeWithOffset = timeSinceBegin + (config.offset || 0)
      let sanityCount = 4
      let timeAbove, timeBelow
      do {
        timeAbove = timeWithOffset > intervalTime
        timeBelow = timeWithOffset < 0
        if (timeAbove) {
          timeWithOffset -= intervalTime
        } else if (timeBelow) {
          timeWithOffset += intervalTime
        }
      } while (--sanityCount && (timeAbove || timeBelow))

      const startValue = isFinite(config.startValue) ? config.startValue : START_VALUE_DEFAULT
      const endValue = isFinite(config.endValue) ? config.endValue : END_VALUE_DEFAULT
      const elapsedTimeRatio = timeWithOffset / intervalTime
      const value = elapsedTimeRatio * (endValue - startValue) + startValue
      if (config.tag)
        dataMap[config.tag] = value
    })
    if (Object.keys(dataMap).length)
      this.emit(DATA_PLUGIN_EVENT_DATA, dataMap)
  }

  destroy() {
    if (this._interval) {
      clearInterval(this._interval)
      this._interval = undefined
    }
  }
}
