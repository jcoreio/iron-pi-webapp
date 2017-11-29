// @flow

import type SubContext from '../symmetry/SubContext'
import type {Middleware, Dispatch} from '../redux/types'
import {createReducer, createMiddleware} from 'mindfront-redux-utils'

export const ACTION_TYPE_PREFIX = '@@symmetry/'
export const CALL = ACTION_TYPE_PREFIX + 'CALL'
export const SUBSCRIBE = ACTION_TYPE_PREFIX + 'SUBSCRIBE'
export const SET_CONNECTING = ACTION_TYPE_PREFIX + 'SET_CONNECTING'
export const SET_OPEN = ACTION_TYPE_PREFIX + 'SET_OPEN'
export const SET_CLOSED = ACTION_TYPE_PREFIX + 'SET_CLOSED'
export const RECONNECT = ACTION_TYPE_PREFIX + 'RECONNECT'

export type ConnectionStatus = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'

export type ConnectionState = {
  status: ConnectionStatus,
  reconnecting: boolean,
  retryCount: number,
  nextRetryTime: ?number,
  retryTimeoutId: ?number,
}

export const initialConnectionState: ConnectionState = {
  status: 'CONNECTING',
  reconnecting: false,
  retryCount: 0,
  nextRetryTime: null,
  retryTimeoutId: null,
}

export type SetConnectingAction = {type: string}
export type SetOpenAction = {type: string}
export type SetClosedAction = {
  type: string,
  payload: {
    nextRetryTime: ?number,
    retryTimeoutId: ?number,
  },
}

export const setConnecting = (): SetConnectingAction => ({type: SET_CONNECTING})
export const setOpen = (): SetOpenAction => ({type: SET_OPEN})
export function setClosed(payload: {nextRetryTime: ?number, retryTimeoutId: ?number}): SetClosedAction {
  return {type: SET_CLOSED, payload}
}

export type SetConnectionStateAction = {
  type: string,
  payload: ConnectionState,
}

export const connectionStateReducer = createReducer(initialConnectionState, {
  [SET_CONNECTING]: (state, action) => state.status === 'CONNECTING' ? state : {
    status: 'CONNECTING',
    retryCount: state.retryCount + 1,
    reconnecting: true,
    nextRetryTime: null,
    retryTimeoutId: null,
  },
  [SET_OPEN]: (state, action) => ({
    status: 'OPEN',
    retryCount: 0,
    reconnecting: false,
    nextRetryTime: null,
    retryTimeoutId: null,
  }),
  [SET_CLOSED]: (state, action) => ({
    status: 'CLOSED',
    retryCount: state.retryCount,
    reconnecting: false,
    ...action.payload
  }),
})

export type CallAction = {
  type: string,
  payload: {
    methodName: string,
    args: Array<any>,
  },
}

export type ReconnectAction = {type: string}
export function reconnect(): ReconnectAction {
  return {type: RECONNECT}
}

export function call(methodName: string, ...args: Array<any>): CallAction {
  return {
    type: CALL,
    payload: {methodName, args},
  }
}

export function dispatchCall<T>(dispatch: Dispatch, methodName: string, ...args: Array<any>): Promise<T> {
  return (dispatch(call(methodName, ...args)): any)
}

export type SubscribeAction = {
  type: string,
  payload: {
    publicationName: string,
    args: Array<any>,
  },
}

export function subscribe(publicationName: string, ...args: Array<any>): SubscribeAction {
  return {
    type: SUBSCRIBE,
    payload: {publicationName, args},
  }
}

export interface Symmetry {
  subscribe(publicationName: string, ...args: Array<any>): ?SubContext;
  call(method: string, ...args: Array<any>): Promise<any>;
}

export function symmetryMiddleware(symmetry: Symmetry): Middleware {
  return createMiddleware({
    [CALL]: store => next => (action: CallAction): Promise<any> => {
      next(action) // nothing handles these actions so it would just waste CPU
      const {payload: {methodName, args}} = action
      return symmetry.call(methodName, ...args)
    },
    [SUBSCRIBE]: store => next => (action: SubscribeAction): ?SubContext => {
      next(action) // nothing handles these actions so it would just waste CPU
      const {payload: {publicationName, args}} = action
      return symmetry.subscribe(publicationName, ...args)
    }
  })
}

