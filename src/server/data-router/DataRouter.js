// @flow

import assert from 'assert'
import EventEmitter from 'events'
import _ from 'lodash'
import logger from 'log4jcore'

import type {DataPlugin, DispatchEvent, TimestampedValuesMap, TimestampedDispatchEvent} from './DataRouterTypes'

const log = logger('DataRouter')

export default class DataRouter extends EventEmitter {
  _plugins: Array<DataPlugin> = [];
  _dispatchInProgress: boolean = false;
  _dispatchEventsQueue: Array<TimestampedDispatchEvent> = [];
  _lastDispatchOk: boolean = true;

  constructor() {
    super()
  }

  addPlugin(plugin: DataPlugin) {
    if (plugin && !this._plugins.includes(plugin)) {
      this._plugins.push(plugin)
      this.pluginsChanged()
    }
  }

  dispatch(event: DispatchEvent) {
    assert(event)
    this._dispatchEventsQueue.push(timestampDispatchData(event))
    if (!this._dispatchInProgress)
      this._runDispatchQueue()
  }

  _runDispatchQueue() {
    try {
      this._dispatchInProgress = true

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

  }
}

export function timestampDispatchData(event: DispatchEvent): TimestampedDispatchEvent {
  const now = Date.now()
  // Apply timestamps to any data that came in without timestamps
  const valuesWithTimestamps: TimestampedValuesMap = _.mapValues(event.values || {}, (entry: any) => ({t: now, v: entry}))
  // Merge with any data that came in with timestamps
  const timestampedValues: TimestampedValuesMap = {...valuesWithTimestamps, ...(event.timestampedValues || {})}
  return {pluginId: event.pluginId, timestampedValues}
}
