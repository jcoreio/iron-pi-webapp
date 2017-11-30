// @flow
/* eslint-disable no-case-declarations */

import _ from 'lodash'
import EventEmitter from 'events'
import devConsole from '../util/devConsole'

import {SYM_PING, SYM_PONG, SYM_ERROR} from './SymmetryProto'
import {toSymErr} from './validate'
import type {NonEmptyString} from '../types/NonEmptyString'

const HEARTBEAT_INTERVAL = 2 * 1000 // Process heartbeat tasks every 2000 ms
const HEARTBEAT_SANITY_MIN = 500 // Detecting jumps in clock time: each time the 2000 ms heartbeat
const HEARTBEAT_SANITY_MAX = 10 * 1000 // interval fires, make sure between 1000 and 10000 ms have elapsed.

const HEARTBEAT_PING_TIME = 8 * 1000 // Send a ping if we haven't gotten any messages in 8 seconds
const HEARTBEAT_TIMEOUT = 16 * 1000 // Close the connection if we haven't gotten any messages in 16 seconds.

export const CONNECTING = 0
export const OPEN = 1
export const CLOSING = 2
export const CLOSED = 3

export default class SymmetryConnBase extends EventEmitter {
  sock: Object;

  curPingId: number = 0;
  outstandingPingId: ?NonEmptyString;
  _lastRxTime: ?number;
  heartbeatInterval: ?number;
  _heartbeatCheckTime: number = 0;
  _heartbeatRxTime: number = 0;

  _logFunc: ?Function;

  constructor(sock: Object) {
    super()
    this._setSock(sock)
  }

  _setSock(sock: Object) {
    if (!_.isObject(sock)) throw new Error("sock must be an object")
    if (sock === this.sock) return

    if (this.sock) {
      // remove our listeners from old sock
      this.sock.onopen = null
      this.sock.onmessage = null
      this.sock.onerror = null
      this.sock.onclose = null
    }

    this.sock = sock

    sock.onopen = event => this._onSockOpen(event)
    sock.onmessage = event => this._onSockMessage(event)
    sock.onerror = error => this._onSockError(error)
    sock.onclose = event => this._onSockClose(event)

    switch (sock.readyState) {
    case CONNECTING:
      setTimeout(() => this.emit('connecting'))
      break
    case OPEN:
      setTimeout(() => this._onSockOpen('open'))
      break
    }
  }

  lastRxTime(): ?number { return this._lastRxTime }

  startHeartbeat() {
    if (this.heartbeatInterval == null) {
      this.heartbeatInterval = setInterval((): void => this._onHeartbeatInterval(), HEARTBEAT_INTERVAL)
      this._heartbeatCheckTime = this._heartbeatRxTime = Date.now()
      this.outstandingPingId = null
    }
  }

  stopHeartbeat() {
    if (this.heartbeatInterval != null) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = undefined
    }
  }

  _send(msg: string, data: Object) {
    const msgOut = {
      ...data,
      msg
    }
    if (this._logFunc) {
      this._logFunc('Tx', msgOut)
    }
    this.sock.send(JSON.stringify(msgOut))
  }

  _onSockMessage(event: Object) {
    this._lastRxTime = this._heartbeatRxTime = Date.now()
    try {
      const message = JSON.parse(event.data)
      if (this._logFunc) {
        this._logFunc('Rx', message)
      }
      this._handleMessage(message)
    } catch (err) {
      devConsole.error("error while handling Symmetry socket message", err.stack)
      this._send(SYM_ERROR, { error: toSymErr(err) })
    }
  }

  _handleMessage(message: {msg: NonEmptyString, id?: NonEmptyString}) {
    const { msg, id } = message
    switch (msg) {
    case SYM_PING:
      const msgOut = {}
      if (id != null) msgOut.id = id
      this._send(SYM_PONG, msgOut)
      break
    case SYM_PONG:
      if (id != null && id === this.outstandingPingId)
        this.outstandingPingId = null
      break
    case SYM_ERROR:
      const {error}: {error: {message: string}} = (message: any)
      devConsole.error("Symmetry connection got an error message: " + error.message)
      break
    default:
      throw new Error("unrecognized message type: " + msg)
    }
  }

  _onHeartbeatInterval() {
    let now = Date.now()
    let heartbeatElapsed = now - this._heartbeatCheckTime
    this._heartbeatCheckTime = now
    if (heartbeatElapsed > HEARTBEAT_SANITY_MIN && heartbeatElapsed < HEARTBEAT_SANITY_MAX) {
      let rxElapsed = now - this._heartbeatRxTime
      if (rxElapsed > HEARTBEAT_TIMEOUT) {
        this._onHeartbeatTimeout()
      } else if (rxElapsed > HEARTBEAT_PING_TIME && !this.outstandingPingId) {
        this.outstandingPingId = String(++this.curPingId)
        this._send(SYM_PING, { id: this.outstandingPingId })
      }
    } else {
      // The clock has jumped. Re-set the rx interval.
      devConsole.error("symmetry heartbeat monitor: clock time jump or high cpu usage detected")
      this._heartbeatRxTime = now
    }
  }

  _onHeartbeatTimeout() {
    devConsole.error("symmetry connection timed out")
    this.stopHeartbeat()
  }

  _onSockOpen(event: any) {
    this.emit('open', event)
  }

  waitUntilOpen(timeout?: number): Promise<void> {
    return new Promise((resolve: () => void, reject: (error: Error) => void) => {
      if (this.sock && this.sock.readyState === OPEN) return resolve()
      this.once('open', resolve)
      if (timeout) setTimeout(() => {
        this.removeListener('open', resolve)
        reject(new Error("symmetry connection timed out"))
      }, timeout)
    })
  }

  _onSockError(err: any) {
    devConsole.error("symmetry connection got a socket error: ", (err && err.stack) ? err.stack : err)
    this.emit('error', err)
  }

  _onSockClose(event: CloseEvent) {
    this.stopHeartbeat()
    this.emit('close', event)
  }

  close() {
    this.sock.close()
  }

  setLogFunc(logFunc: ?Function) {
    this._logFunc = logFunc
  }

  isShutDown(): boolean {
    return !this.sock || this.sock.readyState === CLOSING || this.sock.readyState === CLOSED
  }

  _checkShutDown() {
    if (this.isShutDown()) throw Error('symmetry connection is already shut down')
  }
}
