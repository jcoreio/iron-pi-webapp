// @flow

import assert from 'assert'
import EventEmitter from '@jcoreio/typed-event-emitter'
import _ from 'lodash'
import logger from 'log4jcore'

import calculateMappingInfo from './calculateMappingInfo'
import {DATA_PLUGIN_EVENT_DATA, DATA_PLUGIN_EVENT_TIMESTAMPED_DATA, DATA_PLUGIN_EVENT_IOS_CHANGED} from './PluginTypes'
import type {
  DataPlugin, DispatchEvent, ValuesMap, TimestampedValuesMap, TimestampedDispatchEvent,
  PluginAndMappingsInfo, TimeValuePair} from './PluginTypes'
import type {MappingProblem} from '../../universal/data-router/PluginConfigTypes'
import {pluginKey as getPluginKey} from '../../universal/data-router/PluginConfigTypes'

const log = logger('DataRouter')

const MIN_INGEST_INTERVAL_MILLIS = 50

export const EVENT_MAPPING_PROBLEMS_CHANGED = 'mappingProblemsChanged'

type DataPluginDataListener = (data: ValuesMap) => void
type DataPluginTimestampedDataListener = (data: TimestampedValuesMap) => void

type ListenersForPlugin = {
  dataListener: DataPluginDataListener,
  timestampedDataListener: DataPluginTimestampedDataListener,
}

type DataRouterEvents = {
  mappingProblemsChanged: [Array<MappingProblem>],
}

export default class DataRouter extends EventEmitter<DataRouterEvents> {
  _tagMap: TimestampedValuesMap = {}
  _tags: Array<string> = []
  _publicTags: Array<string> = []

  _plugins: Array<DataPlugin> = []
  _pluginsByKey: Map<string, DataPlugin> = new Map()
  _pluginListeners: Map<string, ListenersForPlugin> = new Map()
  _pluginIOsChangedListener = () => this._pluginIOsChanged()

  _dispatchInProgress: boolean = false;
  _dispatchTime: number = 0;
  _dispatchEventsQueue: Array<TimestampedDispatchEvent> = [];
  _lastDispatchOk: boolean = true;

  _lastIngestTime: number = 0;
  _ingestRateLimitTimeout: ?number;

  _tagsToProviderPluginKeys: Map<string, string> = new Map();
  _tagsToDestinationPluginKeys: Map<string, Set<string>> = new Map();

  _duplicateTags: Set<string> = new Set();
  _mappingProblems: Array<MappingProblem> = [];

  _printedWarningKeys: Set<string> = new Set();

  // Hook to allow unit tests to inject time
  _getTime: () => number = () => Date.now();

  constructor(args: {plugins?: Array<DataPlugin>} = {}) {
    super()
    this.setPlugins(args.plugins || [])
  }

  tagMap(): TimestampedValuesMap { return this._tagMap }
  tags(): Array<string> { return this._tags }
  publicTags(): Array<string> { return this._publicTags }
  mappingProblems(): $ReadOnlyArray<MappingProblem> { return this._mappingProblems }

  getTagValue(tag: string): any {
    const entry = this._tagMap[tag]
    return entry ? entry.v : null
  }
  getTagTimestamp(tag: string): ?number {
    const entry = this._tagMap[tag]
    return entry ? entry.t : null
  }

  stop() {
    if (this._ingestRateLimitTimeout) {
      clearTimeout(this._ingestRateLimitTimeout)
      this._ingestRateLimitTimeout = undefined
    }
    this.setPlugins([])
  }

  setPlugins(plugins: Array<DataPlugin>) {
    const prevPlugins = this._plugins.slice(0)

    const removedPlugins: Array<DataPlugin> = _.difference(this._plugins, plugins)
    removedPlugins.forEach((plugin: DataPlugin) => {
      const eventEmitterPlugin: any = (plugin: any)
      if (_.isFunction(eventEmitterPlugin.removeListener)) {
        const pluginKey = getPluginKey(plugin.pluginInfo())
        const listeners: ?ListenersForPlugin = this._pluginListeners.get(pluginKey)
        if (listeners) {
          eventEmitterPlugin.removeListener(DATA_PLUGIN_EVENT_DATA, listeners.dataListener)
          eventEmitterPlugin.removeListener(DATA_PLUGIN_EVENT_TIMESTAMPED_DATA, listeners.timestampedDataListener)
          this._pluginListeners.delete(pluginKey)
        }
        eventEmitterPlugin.removeListener(DATA_PLUGIN_EVENT_IOS_CHANGED, this._pluginIOsChangedListener)
      }
      if (plugin.destroy)
        plugin.destroy()
    })

    this._plugins = []
    this._pluginsByKey.clear()
    plugins.forEach((plugin: DataPlugin) => {
      try {
        assert(plugin, 'DataRouter got a null plugin')
        const pluginKey = getPluginKey(plugin.pluginInfo())
        const existPlugin = this._pluginsByKey.get(pluginKey)
        if (existPlugin) {
          if (existPlugin === plugin) {
            throw Error(`attempted to add plugin twice: ${pluginKey}`)
          } else {
            throw Error(`there is already a different plugin with the unique ID: ${pluginKey}`)
          }
        }
        this._plugins.push(plugin)
        this._pluginsByKey.set(pluginKey, plugin)
      } catch (err) {
        log.error(`DataRouter could not add DataPlugin instance: ${err.stack}`)
      }
    })

    const addedPlugins: Array<DataPlugin> = _.difference(this._plugins, prevPlugins)
    addedPlugins.forEach((plugin: DataPlugin) => {
      // If the plugin is an EventEmitter, listen to its 'data' event
      const pluginKey = getPluginKey(plugin.pluginInfo())
      const eventEmitterPlugin: any = (plugin: any)
      if (_.isFunction(eventEmitterPlugin.on)) {
        const dataListener : DataPluginDataListener = (data: ValuesMap) =>
          this.dispatch({pluginKey, values: data})
        const timestampedDataListener : DataPluginTimestampedDataListener = (data: TimestampedValuesMap) =>
          this.dispatch({pluginKey, timestampedValues: data})
        eventEmitterPlugin.on(DATA_PLUGIN_EVENT_DATA, dataListener)
        eventEmitterPlugin.on(DATA_PLUGIN_EVENT_TIMESTAMPED_DATA, timestampedDataListener)
        // The pluginIOsChanged listener is the same for all plugins
        eventEmitterPlugin.on(DATA_PLUGIN_EVENT_IOS_CHANGED, this._pluginIOsChangedListener)
        this._pluginListeners.set(pluginKey, {dataListener, timestampedDataListener})
      }
    })

    this._pluginIOsChanged()

    // Call the start() hook after all plugin IOs have been calculated
    addedPlugins.forEach((plugin: DataPlugin) => {
      if (plugin.start)
        plugin.start()
    })
  }

  dispatch(event: DispatchEvent) {
    assert(event)
    const time = this._dispatchInProgress ? this._dispatchTime : this._getTime()
    const cleanedEvent: TimestampedDispatchEvent = this._cleanEvent(timestampDispatchData({event, time}))
    if (Object.keys(cleanedEvent.timestampedValues).length) {
      this._dispatchEventsQueue.push(cleanedEvent)
      // If a dispatch is already in progress,
      if (!this._dispatchInProgress) {
        const minIngestTime = this._lastIngestTime + MIN_INGEST_INTERVAL_MILLIS
        const requiredWaitTime = minIngestTime - time
        if (requiredWaitTime <= 0) {
          this._runDispatchQueue(time)
        } else if (!this._ingestRateLimitTimeout) {
          // Schedule a delayed ingest, if one isn't already scheduled
          this._ingestRateLimitTimeout = setTimeout(() => {
            this._ingestRateLimitTimeout = undefined
            this._runDispatchQueue(this._getTime())
          }, Math.min(requiredWaitTime, MIN_INGEST_INTERVAL_MILLIS))
        }
      }
    }
  }

  _cleanEvent(event: TimestampedDispatchEvent): TimestampedDispatchEvent {
    const {pluginKey, timestampedValues} = event
    let cleanedTimestampedValues
    for (let tag in timestampedValues) {
      if (this._tagsToProviderPluginKeys.get(tag) !== pluginKey) {
        const warningTag = `${pluginKey}-${tag}`
        if (!this._printedWarningKeys.has(warningTag)) {
          this._printedWarningKeys.add(warningTag)
          log.error(this._duplicateTags.has(tag) ?
            `plugin ${pluginKey} cannot set tag ${tag} because it has multiple sources` :
            `plugin ${pluginKey} tried to set tag ${tag} without declaring it as an output`)
        }
        if (!cleanedTimestampedValues) {
          cleanedTimestampedValues = {...timestampedValues}
        }
        delete cleanedTimestampedValues[tag]
      }
    }
    return {...event, timestampedValues: cleanedTimestampedValues || event.timestampedValues}
  }

  _runDispatchQueue(time: number) {
    try {
      this._lastIngestTime = this._dispatchTime = time
      this._dispatchInProgress = true
      let sanityCount = 50
      let tagsChangedThisPass: Set<string> = new Set()
      const tagsChangedThisCycle: Set<string> = new Set()
      let pluginsChangedThisPass: Set<string> = new Set()
      const pluginsChangedThisCycle: Set<string> = new Set()
      do {
        if (--sanityCount <= 0)
          throw Error(`DataRouter detected an infinite loop in the digest cycle`)
        tagsChangedThisPass = new Set()
        pluginsChangedThisPass = new Set()

        const events: Array<TimestampedDispatchEvent> = this._dispatchEventsQueue.slice(0)
        this._dispatchEventsQueue = []
        events.forEach((event: TimestampedDispatchEvent) => {
          const {timestampedValues} = event
          _.forOwn(timestampedValues, (pair: TimeValuePair, tag: string) => {
            const existPair: ?TimeValuePair = this._tagMap[tag]
            if (!existPair || existPair.v !== pair.v)
              tagsChangedThisPass.add(tag)
            this._tagMap[tag] = pair
          })
        })

        tagsChangedThisPass.forEach((tag: string) => {
          tagsChangedThisCycle.add(tag)
          const pluginKeysForTag: ?Set<string> = this._tagsToDestinationPluginKeys.get(tag)
          if (pluginKeysForTag) {
            pluginKeysForTag.forEach((pluginId: string) => pluginsChangedThisPass.add(pluginId))
          }
        })

        pluginsChangedThisPass.forEach((pluginId: string) => {
          const plugin = this._pluginsByKey.get(pluginId)
          if (plugin) {
            pluginsChangedThisCycle.add(pluginId)
            if (plugin.inputsChanged) {
              try {
                plugin.inputsChanged({
                  time,
                  changedTags: tagsChangedThisPass,
                  tagMap: this._tagMap
                })
              } catch (err) {
                const warningKey = `inputsChangedError-${pluginId}`
                if (!this._printedWarningKeys.has(warningKey)) {
                  this._printedWarningKeys.add(warningKey)
                  log.error('caught error during dispatch', err.stack || err)
                }
              }
            }
          } else {
            const warningKey = `missingPlugin-${pluginId}`
            if (!this._printedWarningKeys.has(warningKey)) {
              this._printedWarningKeys.add(warningKey)
              log.error(Error(`could not find plugin with ID ${pluginId}`).stack)
            }
          }
        })
      } while (pluginsChangedThisPass.size)

      // Call dispatchCycleDone on each plugin
      this._plugins.forEach((plugin: DataPlugin) => {
        if (plugin.dispatchCycleDone) {
          const pluginKey = getPluginKey(plugin.pluginInfo())
          try {
            (plugin: any).dispatchCycleDone({
              time,
              changedTags: tagsChangedThisCycle,
              inputsChanged: pluginsChangedThisCycle.has(pluginKey),
              tagMap: this._tagMap
            })
          } catch (err) {
            const warningKey = `dispatchCycleDoneError-${pluginKey}`
            if (!this._printedWarningKeys.has(warningKey)) {
              this._printedWarningKeys.add(warningKey)
              log.error('caught error during dispatchCycleDone', err.stack || err)
            }
          }
        }
      })

      this._lastDispatchOk = true
    } catch (err) {
      // use this._lastDispatchOk to avoid repeatedly logging errors
      if (this._lastDispatchOk)
        log.error(`Error during DataRouter dispatch: ${err.stack || err}`)
      this._lastDispatchOk = false
    } finally {
      this._dispatchInProgress = false
    }
  }

  _pluginIOsChanged() {
    const pluginMappings: Array<PluginAndMappingsInfo> = []
    this._plugins.forEach((plugin: DataPlugin) => {
      try {
        pluginMappings.push({
          pluginType: plugin.pluginInfo().pluginType,
          pluginId: plugin.pluginInfo().pluginId,
          pluginName: plugin.pluginInfo().pluginName,
          mappings: plugin.ioMappings()
        })
      } catch (err) {
        log.error(`Error while getting I/O mappings from plugin: ${err.stack}`)
      }
    })

    const {tags, publicTags, tagsToProviderPluginKeys, tagsToDestinationPluginKeys, duplicateTags, mappingProblems} =
      calculateMappingInfo(pluginMappings)
    const publicTagsChanged = !_.isEqual(publicTags, this._publicTags)
    this._tags = tags
    this._publicTags = publicTags
    this._tagsToProviderPluginKeys = tagsToProviderPluginKeys
    this._tagsToDestinationPluginKeys = tagsToDestinationPluginKeys
    this._duplicateTags = duplicateTags
    if (!_.isEqual(mappingProblems, this._mappingProblems)) {
      this._mappingProblems = mappingProblems
      this.emit(EVENT_MAPPING_PROBLEMS_CHANGED, mappingProblems)
    }
    if (publicTagsChanged) {
      this._plugins.forEach((plugin: DataPlugin) => {
        if (plugin.tagsChanged)
          plugin.tagsChanged()
      })
    }
  }
}

export function timestampDispatchData(args: {event: DispatchEvent, time: number}): TimestampedDispatchEvent {
  const {event, time} = args
  // Apply timestamps to any data that came in without timestamps
  const valuesWithTimestamps: TimestampedValuesMap = _.mapValues(event.values || {}, (entry: any) => ({t: time, v: entry}))
  // Merge with any data that came in with timestamps
  const timestampedValues: TimestampedValuesMap = {...valuesWithTimestamps, ...(event.timestampedValues || {})}
  return {pluginKey: event.pluginKey, timestampedValues}
}
