// @flow
// @flow-runtime assert

/* eslint-disable no-case-declarations */

import {SYM_SUB_EVENT, SYM_UNSUB, SYM_NOSUB, SYM_EVENT,
  SYM_METHOD, SYM_RESULT} from '../../universal/symmetry/SymmetryProto'

import SubContext from '../../universal/symmetry/SubContext'
import {fromSymErr} from '../../universal/symmetry/validate'
import SymmetryConnBase, {OPEN} from '../../universal/symmetry/SymmetryConnBase'
import emitted from 'promisify-event'
import type {NonEmptyString} from '../../universal/types/NonEmptyString'
import type {SymmetryErr} from '../../universal/symmetry/types'

const CALL_TIMEOUT = 16000

type ResolveFunc = (result: any) => void
type RejectFunc = (error: Error) => void

type Sub = {
  id: NonEmptyString,
  publicationName: NonEmptyString,
  args: Array<any>,
  callback: ?Function,
  context: SubContext,
}

type RequestDef = {
  method: NonEmptyString,
  time: number,
  resolve: ResolveFunc,
  reject: RejectFunc,
}

type Options = {
  useHeartbeat?: boolean,
}

//import type { Path, NodeCallback } from './SymmetryFlowTypes'

/**
 * Symmetry protocol client. Allows method calls and event subscriptions.
 */
export default class SymmetryClient extends SymmetryConnBase {
  subscriptions: Map<NonEmptyString, Sub> = new Map();
  requests: Map<NonEmptyString, RequestDef> = new Map();
  curSubId: number = 0;
  curRequestId: number = 0;
  useHeartbeat: boolean;

  constructor(sock: Object, {useHeartbeat}: Options = {}) {
    super(sock)
    this.useHeartbeat = Boolean(useHeartbeat)
  }

  /**
   * @param subDefIn string event name, or object with string event property and other optional params.
   * @param listenerDefIn callback function, or object with onEvent(event) and onSubError(event) functions
   * @returns {string} subscription id
   */
  subscribe(publicationName: NonEmptyString, ...args: Array<any>): SubContext {
    const lastArg: any = args.length ? args[args.length - 1] : undefined
    const callback: ?Function = lastArg instanceof Function ? lastArg : undefined
    const argsWithoutCallback: Array<any> = callback ? args.slice(0, args.length - 1) : args


    const id = (++this.curSubId).toString()
    const context: SubContext = new SubContext({stop: () => this._stop(id)})
    const sub: Sub = {
      id,
      publicationName,
      args: argsWithoutCallback,
      callback,
      context
    }
    this.subscriptions.set(id, sub)
    try {
      this._send(SYM_SUB_EVENT, {id, publicationName, args: argsWithoutCallback})
    } catch (error) {
      // ignore (assume it's because the connection closed; we'll resume the sub when we reconnect)
    }
    return context
  }

  resumeSubscriptions() {
    this.subscriptions.forEach((sub: Sub) => {
      const {id, publicationName, args} = sub
      this._send(SYM_SUB_EVENT, {id, publicationName, args, resubscribe: true})
    })
  }

  _stop(id: NonEmptyString) {
    if (this.subscriptions.delete(id) && !this.isShutDown()) {
      this._send(SYM_UNSUB, { id })
    }
  }

  async call(method: NonEmptyString, ...args: Array<any>): Promise<any> {
    if (this.sock.readyState !== OPEN) { // sort of ugly, this is only here so that tests can be more synchronous
      await this.waitUntilOpen(CALL_TIMEOUT)
    }
    const id = (++this.curRequestId).toString()
    this._send(SYM_METHOD, { id, method, params: args })
    return new Promise((resolve: ResolveFunc, reject: RejectFunc) => {
      this.requests.set(id, { method, resolve, reject, time: Date.now() })
    })
  }

  _handleMessage(message: {msg: NonEmptyString, id?: NonEmptyString}) {
    const {msg} = message
    switch (msg) {
    case SYM_EVENT: {
      const {id, eventName, payload}: {id: NonEmptyString, eventName: NonEmptyString, payload: Array<any>} = (message: any)
      const sub = this.subscriptions.get(id)
      if (!sub) break
      const {callback, context} = sub || {}
      if (typeof callback === 'function')
        callback(...payload)
      context.emit(eventName, ...payload)
    } break
    case SYM_RESULT: {
      let { id, error, result }: {id: NonEmptyString, error?: SymmetryErr, result: any} = (message: any)
      let request = this.requests.get(id)
      if (!request) throw new Error("could not find the request for a method result message: " + id)
      this.requests.delete(id)
      error ? request.reject(fromSymErr(error)) : request.resolve(result)
    } break
    case SYM_NOSUB: {
      const { id, error }: {id: NonEmptyString, error: SymmetryErr} = (message: any)
      const sub = this.subscriptions.get(id)
      if (!sub) break
      notifySubError(sub, fromSymErr(error))
      this.subscriptions.delete(id)
    } break
    default:
      super._handleMessage(message)
    }
  }

  _onSockOpen(event: any) {
    super._onSockOpen(event)
    if (this.useHeartbeat) this.startHeartbeat()
  }

  _onSockClose(event: CloseEvent) {
    super._onSockClose(event)
    // note: requests are errored out but subscriptions aren't, because they will be restarted upon reconnection
    this._failRequests()
  }

  _onHeartbeatTimeout() {
    super._onHeartbeatTimeout()
    this._failRequests()
    this.emit('heartbeatTimeout')
  }

  _failRequests() {
    this.requests.forEach((request: RequestDef): void => request.reject(new Error('connection closed')))
    this.requests.clear()
  }

  reconnect(): Promise<void> {
    this._failRequests()
    const oldSock = this.sock
    const WebSocket = oldSock.constructor
    const sock = new WebSocket(oldSock.url)
    this._setSock(sock)
    oldSock.close()
    return Promise.race([
      emitted(this, 'open'),
      emitted(this, 'error').then(() => {
        throw new Error('reconnection failed')
      })
    ])
  }
}

function notifySubError(sub: Sub, err: Error) {
  sub.context.emit('error', err)
}

