// @flow

import assert from 'assert'
import EventEmitter from 'events'
import _ from 'lodash'
import logger from 'log4jcore'

import calculateMappingInfo from './calculateMappingInfo'
import type {
  DataPlugin, DispatchEvent, TimestampedValuesMap, TimestampedDispatchEvent,
  PluginAndMappingsInfo, TimeValuePair
} from './DataRouterTypes'
import type {MappingProblem} from '../../universal/data-router/TagMappingTypes'

const log = logger('DataRouter')

const MIN_INGEST_INTERVAL_MILLIS = 50

const EVENT_MAPPING_PROBLEMS_CHANGED = 'mappingProblemsChanged'

export default class DataRouter extends EventEmitter {
  _tagMap: TimestampedValuesMap = {}

  _plugins: Array<DataPlugin> = [];
  _pluginsById: Map<string, DataPlugin> = new Map()

  _dispatchInProgress: boolean = false;
  _dispatchTime: number = 0;
  _dispatchEventsQueue: Array<TimestampedDispatchEvent> = [];
  _lastDispatchOk: boolean = true;

  _lastIngestTime: number = 0;
  _ingestRateLimitTimeout: ?number;

  _tagsToProviderPluginIds: Map<string, string> = new Map();
  _tagsToDestinationPluginIds: Map<string, Set<string>> = new Map();

  _duplicateTags: Set<string> = new Set();
  _mappingProblems: Array<MappingProblem> = [];

  _printedWarningKeys: Set<string> = new Set();

  constructor() {
    super()
  }

  stop() {
    if (this._ingestRateLimitTimeout) {
      clearTimeout(this._ingestRateLimitTimeout)
      this._ingestRateLimitTimeout = undefined
    }
  }

  addPlugin(plugin: DataPlugin) {
    assert(plugin)
    const existPlugin = this._pluginsById.get(plugin.pluginInstanceId())
    if (existPlugin) {
      if (existPlugin === plugin) {
        log.error(`ignoring attempt to add plugin more than once: ${plugin.pluginType()} ${plugin.pluginInstanceId()} ${plugin.pluginInstanceName()}`)
        return
      } else {
        throw Error(`there is already a different plugin with the unique ID ${plugin.pluginInstanceId()}`)
      }
    }
    this._plugins.push(plugin)
    this._pluginsById.set(plugin.pluginInstanceId(), plugin)
    this.pluginsChanged()
  }

  dispatch(event: DispatchEvent) {
    assert(event)
    const time = this._dispatchInProgress ? this._dispatchTime : Date.now()
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
            this._runDispatchQueue(Date.now())
          }, Math.min(requiredWaitTime, MIN_INGEST_INTERVAL_MILLIS))
        }
      }
    }
  }

  _cleanEvent(event: TimestampedDispatchEvent): TimestampedDispatchEvent {
    const {pluginId, timestampedValues} = event
    let cleanedTimestampedValues
    for (let tag in timestampedValues) {
      if (this._tagsToProviderPluginIds.get(tag) !== pluginId) {
        const warningTag = `${pluginId}-${tag}`
        if (!this._printedWarningKeys.has(warningTag)) {
          this._printedWarningKeys.add(warningTag)
          log.error(this._duplicateTags.has(tag) ?
            `plugin ${pluginId} cannot set tag ${tag} because it has multiple sources` :
            `plugin ${pluginId} tried to set tag ${tag} without declaring it as an output`)
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
      const tagsChangedThisPass: Set<string> = new Set()
      const tagsChangedThisCycle: Set<string> = new Set()
      const pluginsChangedThisPass: Set<string> = new Set()
      const pluginsChangedThisCycle: Set<string> = new Set()
      do {
        if (--sanityCount <= 0)
          throw Error(`DataRouter detected an infinite loop in the digest cycle`)
        tagsChangedThisPass.clear()
        pluginsChangedThisPass.clear()

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
          const pluginIdsForTag: ?Set<string> = this._tagsToDestinationPluginIds.get(tag)
          if (pluginIdsForTag) {
            pluginIdsForTag.forEach((pluginId: string) => pluginsChangedThisPass.add(pluginId))
          }
        })

        pluginsChangedThisPass.forEach((pluginId: string) => {
          const plugin = this._pluginsById.get(pluginId)
          if (plugin) {
            pluginsChangedThisCycle.add(pluginId)
            try {
              plugin.inputsChanged({time, changedTags: tagsChangedThisPass})
            } catch (err) {
              const warningKey = `inputsChangedError-${pluginId}`
              if (!this._printedWarningKeys.has(warningKey)) {
                this._printedWarningKeys.add(warningKey)
                log.error('caught error during dispatch', err.stack || err)
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
        try {
          plugin.dispatchCycleDone({
            time,
            changedTags: tagsChangedThisCycle,
            didInputsChange: pluginsChangedThisCycle.has(plugin.pluginInstanceId())
          })
        } catch (err) {
          const warningKey = `dispatchCycleDoneError-${plugin.pluginInstanceId()}`
          if (!this._printedWarningKeys.has(warningKey)) {
            this._printedWarningKeys.add(warningKey)
            log.error('caught error during dispatchCycleDone', err.stack || err)
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

  pluginsChanged() {
    const pluginMappings: Array<PluginAndMappingsInfo> = this._plugins.map((plugin: DataPlugin) => ({
      pluginType: plugin.pluginType(),
      pluginInstanceId: plugin.pluginInstanceId(),
      pluginInstanceName: plugin.pluginInstanceName(),
      mappings: plugin.ioMappings()
    }))

    const {tagsToProviderPluginIds, tagsToDestinationPluginIds, duplicateTags, mappingProblems} =
      calculateMappingInfo(pluginMappings)
    this._tagsToProviderPluginIds = tagsToProviderPluginIds
    this._tagsToDestinationPluginIds = tagsToDestinationPluginIds
    this._duplicateTags = duplicateTags
    if (!_.isEqual(mappingProblems, this._mappingProblems)) {
      this._mappingProblems = mappingProblems
      this.emit(EVENT_MAPPING_PROBLEMS_CHANGED, mappingProblems)
    }
  }
}

export function timestampDispatchData(args: {event: DispatchEvent, time: number}): TimestampedDispatchEvent {
  const {event, time} = args
  // Apply timestamps to any data that came in without timestamps
  const valuesWithTimestamps: TimestampedValuesMap = _.mapValues(event.values || {}, (entry: any) => ({t: time, v: entry}))
  // Merge with any data that came in with timestamps
  const timestampedValues: TimestampedValuesMap = {...valuesWithTimestamps, ...(event.timestampedValues || {})}
  return {pluginId: event.pluginId, timestampedValues}
}