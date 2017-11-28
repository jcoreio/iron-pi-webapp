// @flow
// @flow-runtime assert
/* eslint-disable no-console */
/* eslint-disable no-case-declarations */

import util from 'util'

import {SYM_SUB_EVENT, SYM_UNSUB,
  SYM_METHOD, SYM_RESULT, SYM_EVENT} from './../../universal/symmetry/SymmetryProto'
import {globalMethods, globalPublications} from './index'
import logger from '../../universal/logger'
import SymmetryConnBase from '../../universal/symmetry/SymmetryConnBase'
import {toSymErr} from '../../universal/symmetry/validate'

import type {MethodsDef, PublicationsDef, SubContext, MethodContext} from './types'
import type {ServerUser} from '../types/ServerUser'
import type {NonEmptyString} from '../../universal/types/NonEmptyString'

const log = logger('SymmetryServer')

type SymmetryServerOpts = {
  socket: Object,
  methods?: MethodsDef,
  publications?: PublicationsDef
}

type ServerEventSub = {
  id: string,
  onStop: () => void
}

/**
 * Server side connection handler for the Symmetry protocol, which is similar to
 */
export default class SymmetryServer extends SymmetryConnBase {

  methods: ?MethodsDef;
  publications: ?PublicationsDef
  subscriptions: Map<string, ServerEventSub> = new Map();

  _user: ?ServerUser;

  /**
   * @param opts Object with the following fields:
   *   socket: WebSocket for this connection
   *   dataUpdatesProvider
   *   storedTimeSeriesDataProvider
   *   syncedStateProvider
   */
  constructor(opts: SymmetryServerOpts) {
    let {socket, methods, publications} = opts
    super(socket)
    this.methods = methods
    this.publications = publications
  }

  setUser(user: ?ServerUser) {
    this._user = user
  }

  _handleMessage(message: {msg: NonEmptyString}) {
    const {msg} = message
    switch (msg) {
    case SYM_SUB_EVENT:
      this._handleSubRequest(message)
      break
    case SYM_UNSUB: {
      const {id} = (message: {id: NonEmptyString})
      const sub = this.subscriptions.get(id)
      if (sub) this._stopSub(sub)
    } break
    case SYM_METHOD: {
      const {id, method, params} = (message: {id: NonEmptyString, method: NonEmptyString, params: Array<any>})
      try {
        this._handleMethodCall(id, method, params || [])
      } catch (err) {
        console.error('Error handling a subscription request: ', err.stack)
        this._send(SYM_RESULT, { id, error: toSymErr(err) })
      }
    } break
    default: super._handleMessage(message)
    }
  }

  _handleMethodCall(id: string, method: string, params: Array<any>) {
    try {
      const handler = this.methods ? this.methods[method] : globalMethods[method]
      if (!handler) throw Error(`method not found: ${method}`)
      if (typeof handler !== 'function') throw Error(`invalid handler for method ${method}: type must be 'function', is '${typeof handler}'`)
      const handlerResult: any = handler(this._methodContext(), ...params)
      if (handlerResult && handlerResult.then instanceof Function) {
        // Promise
        handlerResult.then((promiseResult: any): void => this._sendMethodSuccess(id, promiseResult))
          .catch((err: any): void => {
            log.error(`Method handler failed for method ${method}, params ${util.inspect(params)}: ${err.stack || err}`)
            this._sendMethodFailure(id, err, {silent: true})
          })
      } else {
        this._sendMethodSuccess(id, handlerResult)
      }
    } catch (err) {
      log.error(`Could not call handler for method ${method}, params ${util.inspect(params)}: ${err.stack || err}`)
      this._sendMethodFailure(id, err, {silent: true})
    }
  }

  //----------------------------------------------------------------------------
  // Subscription Handling
  //----------------------------------------------------------------------------

  _handleSubRequest(message: {id: NonEmptyString, publicationName: NonEmptyString, args: Array<any>, resubscribe?: boolean}) {
    const {id, publicationName, args, resubscribe} = message

    let stopped = false
    let handlerStopCallback: ?()=> void

    const emit = (eventName: string, ...payload: Array<any>) => {
      if (stopped) return
      if (eventName === 'stop') {
        stopped = true
        this.subscriptions.delete(id)
      }
      this._send(SYM_EVENT, {id, eventName, payload})
    }

    const subContext: SubContext = {
      ...this._methodContext(),
      emit,
      stop: (err?: any) => emit('stop', toSymErr(err)),
      onStop: (callback: () => void) => { handlerStopCallback = callback }
    }

    try {
      requireNonEmptyString(id, 'id')
      let sub: ?ServerEventSub
      if (this.subscriptions.has(id)) {
        if (!resubscribe) throw Error(`a subscription already exists for id ${id}`)
        sub = this.subscriptions.get(id)
      }
      requireNonEmptyString(publicationName, 'publicationName')
      let handler = this.publications ? this.publications[publicationName] : globalPublications[publicationName]
      if (!handler) throw Error(`no handler for publication ${publicationName}`)

      if (!sub) sub = {
        id,
        onStop: () => {
          stopped = true
          handlerStopCallback && handlerStopCallback()
        }
      }

      const handlerResult: any = handler(subContext, ...args)
      if (handlerResult && handlerResult.then instanceof Function) {
        // Promise
        handlerResult.catch((err: any) => emit('stop', toSymErr(err)))
      }
      this.subscriptions.set(id, sub)
    } catch (err) {
      log.error(`Could not create subscription: ${err.stack}`)
      emit('stop', toSymErr(err))
    }
  }

  _methodContext(): MethodContext {
    return {
      connection: this,
      user: this._user,
      // $FlowFixMe: id is a number here
      userId: this._user && this._user.id
    }
  }

  _stopSub(sub: ServerEventSub) {
    sub.onStop()
    this.subscriptions.delete(sub.id)
  }

  _sendMethodSuccess(id: string, result: any) {
    const message: Object = { id }
    if (result !== undefined) message.result = result
    this._send(SYM_RESULT, message)
  }

  _sendMethodFailure(id: string, err: any, opts: {silent?: boolean} = {}) {
    const silent = !!(opts.silent || (err && typeof err === 'object' && err.silent))
    if (!silent)
      console.error('error handling a method invocation: ', err.stack || err)
    this._send(SYM_RESULT, { id, error: toSymErr(err) })
  }

  _onSockClose(event: CloseEvent) {
    super._onSockClose(event)
    this.subscriptions.forEach((sub: ServerEventSub): void => this._stopSub(sub))
    this.subscriptions.clear()
  }
}

