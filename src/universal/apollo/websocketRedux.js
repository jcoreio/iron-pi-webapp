// @flow

import {combineReducers} from 'redux'
import {createReducer} from 'mindfront-redux-utils'
import type {Dispatch} from '../redux/types'

export type WebsocketState = 'connecting' | 'connected' | 'reconnecting' | 'disconnected'

export type WebsocketStateSubtree = {
  state: WebsocketState,
}

export const initWebsocketStateSubtree = {
  state: 'connecting',
}

export type SetWebsocketStateAction = {
  type: string,
  payload: WebsocketState,
}

export const SET_WEBSOCKET_STATE = 'SET_WEBSOCKET_STATE'

export function setWebsocketState(payload: WebsocketState): SetWebsocketStateAction {
  return {
    type: SET_WEBSOCKET_STATE,
    payload,
  }
}

export const websocketReducer = combineReducers({
  state: createReducer(initWebsocketStateSubtree.state, {
    [SET_WEBSOCKET_STATE]: (state, {payload}: SetWebsocketStateAction) => payload,
  })
})

export function websocketEventHandlers(dispatch: Dispatch): {
  onConnected: () => any,
  onConnecting: () => any,
  onReconnected: () => any,
  onReconnecting: () => any,
  onDisconnected: () => any,
} {
  return {
    onConnected: () => dispatch(setWebsocketState('connected')),
    onConnecting: () => dispatch(setWebsocketState('connecting')),
    onReconnected: () => dispatch(setWebsocketState('connected')),
    onReconnecting: () => dispatch(setWebsocketState('reconnecting')),
    onDisconnected: () => dispatch(setWebsocketState('disconnected')),
  }
}

