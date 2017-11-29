// @flow

import {Map} from 'immutable'
import {createReducer} from 'mindfront-redux-utils'
import type {Reducer} from 'redux'
import type {Action} from './types'

type DataPoint = {
  t: number,
  v: number,
}

export type RealTimeDataJSON = {[channelId: string]: DataPoint}
export type RealTimeData = Map<string, DataPoint>

export function parseRealTimeData(data?: RealTimeDataJSON): RealTimeData {
  return Map(data)
}

export const SET_REAL_TIME_DATA = 'SET_REAL_TIME_DATA'

export type SetRealTimeDataAction = {
  type: 'SET_REAL_TIME_DATA',
  payload: RealTimeDataJSON,
}

export function setRealTimeData(data: RealTimeDataJSON): SetRealTimeDataAction {
  return {
    type: SET_REAL_TIME_DATA,
    payload: data,
  }
}

export const realTimeDataReducer: Reducer<?RealTimeData, Action> = createReducer(Map(), {
  [SET_REAL_TIME_DATA]: (state, action) => state.merge(action.payload)
})

