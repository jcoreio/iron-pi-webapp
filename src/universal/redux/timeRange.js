import Record from './Record'
import moment from 'moment'
import {createReducer} from 'mindfront-redux-utils'

export type TimeRangePreset = 'day' | 'week' | 'month' | 'year'

const timeRangeInit = {
  beginTime: moment().startOf('day').valueOf(),
  endTime: moment().endOf('day').valueOf(),
  animate: (false: boolean),
}
export type TimeRangeFields = typeof timeRangeInit

export class TimeRange extends Record(timeRangeInit) {
  beginTime: number
  endTime: number
  animate: boolean
}

export const SET_TIME_RANGE = 'SET_TIME_RANGE'
export const SET_TIME_RANGE_PRESET = 'SET_TIME_RANGE_PRESET'

export type SetTimeRangeAction = {
  type: string,
  payload: {
    beginTime: number,
    endTime: number,
    hoveredTime?: number,
    animate: boolean,
  }
}

export function setTimeRange(beginTime: number, endTime: number, animate?: boolean, hoveredTime?: number): SetTimeRangeAction {
  const payload = {beginTime, endTime, animate: Boolean(animate)}
  if (hoveredTime != null) (payload: Object).hoveredTime = hoveredTime
  return {
    type: SET_TIME_RANGE,
    payload,
  }
}

export type SetTimeRangePresetAction = {
  type: string,
  payload: ?TimeRangePreset,
}

export function setTimeRangePreset(preset: TimeRangePreset): SetTimeRangePresetAction {
  return {
    type: SET_TIME_RANGE_PRESET,
    payload: preset,
  }
}

export const setTimeRangeReducer = createReducer(new TimeRange(), {
  [SET_TIME_RANGE]: (state, {payload: {beginTime, endTime, animate}}) => {
    return state.merge({
      beginTime,
      endTime,
      animate: animate || false,
    })
  },
  [SET_TIME_RANGE_PRESET]: (state, {payload}) => state.merge({
    beginTime: moment().startOf(payload).valueOf(),
    endTime: moment().endOf(payload).valueOf(),
    animate: true,
  }),
})

export const setTimeRangePresetReducer = createReducer('day', {
  [SET_TIME_RANGE]: () => null,
  [SET_TIME_RANGE_PRESET]: (state, action) => action.payload,
})
