// @flow

import {combineReducers} from 'redux'
import {createReducer} from 'mindfront-redux-utils'

export type SidebarState = {
  open: ?boolean,
}

const SIDEBAR = 'SIDEBAR.'

const SET_SIDEBAR_OPEN = SIDEBAR + 'SET_OPEN'

export function setSidebarOpen(open: boolean): {type: string, payload: boolean} {
  return {
    type: SET_SIDEBAR_OPEN,
    payload: open,
  }
}

export const sidebarReducer = combineReducers({
  open: createReducer(null, {
    [SET_SIDEBAR_OPEN]: (state, action) => action.payload,
  }),
})

