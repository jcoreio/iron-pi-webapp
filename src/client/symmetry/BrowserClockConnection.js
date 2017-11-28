// @flow

import assert from 'assert'
import events from 'events'

import _ from 'lodash'

import devConsole from '../../universal/util/devConsole'

import type SymmetryClient from './SymmetryClient'

const METHOD_GET_TIME = 'getTime'

const NUM_QUERIES = 5
const TIME_BETWEEN_QUERIES = 10 // milliseconds

type RemoteTimeResult = {
  offset: number,
  latency: number
}

export default class BrowserClockConnection extends events.EventEmitter {

  _connManager: SymmetryClient;
  _remoteTimeResults: Array<RemoteTimeResult> = [];
  _clockOffset: ?number

  constructor(connManager: SymmetryClient) {
    super()
    this._connManager = connManager
  }

  attemptClockSet = () => {
    const startTime = Date.now()
    try {
      this._connManager.call(METHOD_GET_TIME, (fetchErr: any, result: Object) => {
        try {
          if (fetchErr) {
            throw (fetchErr instanceof Error) ? fetchErr : new Error(String(fetchErr))
          }
          const endTime = Date.now()
          assert(_.isObject(result))
          const { time } = result
          if (!isFinite(time)) throw new Error("time cannot be infinite")
          if (isNaN(time)) throw new Error("time cannot be NaN")
          if (time < 1450000000000) throw new Error(`time is out of range: ${new Date(+time).toString()}`)
          const offset = endTime - time
          const latency = endTime - startTime
          if (latency < 0) throw new Error("latency cannot be less than zero: " + latency)
          this._remoteTimeResults.push({ offset, latency })
          this._onGetTimeSuccess()
        } catch (err) {
          devConsole.error("could not set clock", err.stack)
        }
      })
    } catch (err) {
      devConsole.error("could not set clock", err.stack)
    }
  };

  _onGetTimeSuccess() {
    if (this._remoteTimeResults.length < NUM_QUERIES) {
      setTimeout(this.attemptClockSet, TIME_BETWEEN_QUERIES)
    } else {
      // Throw out the first result, since it tends to take longer and over-state the latency
      let samples = this._remoteTimeResults.slice(1)
      let avgOffset = samples.reduce((prev: number, cur: RemoteTimeResult): number => prev + cur.offset, 0) / samples.length
      let avgLatency = samples.reduce((prev: number, cur: RemoteTimeResult): number => prev + cur.latency, 0) / samples.length
      const offset = this._clockOffset = Math.floor(avgOffset + (avgLatency / 2))
      this.emit('clockOffsetChange', offset)
    }
  }

  getClockOffset(): ?number {
    return this._clockOffset
  }
}

