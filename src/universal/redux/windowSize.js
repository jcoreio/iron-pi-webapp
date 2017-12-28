// @flow

import {createReducer} from 'mindfront-redux-utils'

export type WindowSize = {
  width: ?number,
  height: ?number,
}

const SET_WINDOW_SIZE = 'SET_WINDOW_SIZE'

export function setWindowSize(payload: WindowSize): {type: string, payload: WindowSize} {
  return {
    type: SET_WINDOW_SIZE,
    payload,
  }
}

export const windowSizeReducer = createReducer({
  width: null,
  height: null,
}, {
  [SET_WINDOW_SIZE]: (state, action) => action.payload,
})

