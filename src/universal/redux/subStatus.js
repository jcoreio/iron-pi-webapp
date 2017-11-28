// @flow

import {createReducer} from 'mindfront-redux-utils'
import type {Reducer} from './types'

export type SubStatus = {
  ready: boolean,
  error: ?Error,
}

export const SET_SUB_STATUS = 'SET_SUB_STATUS'

export type SetSubStatusAction = {
  type: 'SET_SUB_STATUS',
  payload: $Shape<SubStatus>,
}

export function setSubNotReady(): SetSubStatusAction {
  return {
    type: SET_SUB_STATUS,
    payload: {ready: false, error: null},
  }
}

export function setSubReady(): SetSubStatusAction {
  return {
    type: SET_SUB_STATUS,
    payload: {ready: true, error: null},
  }
}

export function setSubError(error: Error): SetSubStatusAction {
  return {
    type: SET_SUB_STATUS,
    payload: {ready: false, error},
  }
}

export const subStatusActions = {
  setSubNotReady,
  setSubReady,
  setSubError,
}

export const initialSubStatus = {
  ready: false,
  error: null,
}

export const subStatusReducer: Reducer<SubStatus, SetSubStatusAction> = createReducer(initialSubStatus, {
  [SET_SUB_STATUS]: (state: SubStatus, action: SetSubStatusAction) => ({...state, ...action.payload}),
})

