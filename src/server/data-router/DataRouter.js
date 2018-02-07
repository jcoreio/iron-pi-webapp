// @flow

import assert from 'assert'
import EventEmitter from 'events'
import _ from 'lodash'
import logger from 'log4jcore'

import calculateMappingInfo from './calculateMappingInfo'
import type {DataPlugin, DispatchEvent, TimestampedValuesMap, TimestampedDispatchEvent,
  PluginAndMappingsInfo} from './DataRouterTypes'
import type {MappingProblem} from '../../universal/data-router/TagMappingTypes'

const log = logger('DataRouter')

const MIN_INGEST_INTERVAL_MILLIS = 50

const EVENT_MAPPING_PROBLEMS_CHANGED = 'mappingProblemsChanged'

export default class DataRouter extends EventEmitter {
  _plugins: Array<DataPlugin> = [];
  _dispatchInProgress: boolean = false;
  _dispatchTime: number = 0;
  _dispatchEventsQueue: Array<TimestampedDispatchEvent> = [];
  _lastDispatchOk: boolean = true;

  _lastIngestTime: number = 0;
  _ingestRateLimitTimeout: ?number;

  _tagsToPluginInstanceIds: Map<string, string> = new Map();
  _duplicateTags: Set<string> = new Set();
  _mappingProblems: Array<MappingProblem> = [];

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
    if (plugin && !this._plugins.includes(plugin)) {
      this._plugins.push(plugin)
      this.pluginsChanged()
    }
  }

  dispatch(event: DispatchEvent) {
    assert(event)
    const time = this._dispatchInProgress ? this._dispatchTime : Date.now()
    this._dispatchEventsQueue.push(timestampDispatchData({event, time}))
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

  _runDelayedDispatch() {

  }

  _runDispatchQueue(time: number) {
    try {
      this._lastIngestTime = this._dispatchTime = time
      this._dispatchInProgress = true
      // let sanityCount = 50
      // do {
      //
      // } while (--sanityCount)
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
    const pluginMappings: Array<PluginAndMappingsInfo> = []
    const {tagsToPluginInstanceIds, duplicateTags, mappingProblems} = calculateMappingInfo(pluginMappings)
    this._tagsToPluginInstanceIds = tagsToPluginInstanceIds
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

// export function mergeDispatchQueueEntries(entries: Array<TimestampedDispatchEvent>): TimestampedDispatchEvent {
//
// }
