// @flow

import {Map} from 'immutable'
import {combineReducers} from 'redux'
import {createReducer} from 'mindfront-redux-utils'

export type SectionName = 'localIO'

export type SidebarState = {
  open: ?boolean,
  expandedSections: Map<SectionName, boolean>,
}

export type SidebarStateJSON = {
  open: ?boolean,
  expandedSections: {[section: SectionName]: boolean},
}

export function parseSidebarState({expandedSections, ...rest}: SidebarStateJSON): SidebarState {
  return {
    ...rest,
    expandedSections: Map(expandedSections),
  }
}

const SIDEBAR = 'SIDEBAR.'

const SET_SIDEBAR_OPEN = SIDEBAR + 'SET_OPEN'
const SET_SECTION_EXPANDED = SIDEBAR + 'SET_SECTION_EXPANDED'

export function setSidebarOpen(open: boolean): {type: string, payload: boolean} {
  return {
    type: SET_SIDEBAR_OPEN,
    payload: open,
  }
}

type SetSectionExpandedAction = {
  type: string,
  payload: boolean,
  meta: {section: SectionName},
}

export function setSectionExpanded(section: SectionName, expanded: boolean): SetSectionExpandedAction {
  return {
    type: SET_SECTION_EXPANDED,
    payload: expanded,
    meta: {section},
  }
}

export const sidebarReducer = combineReducers({
  open: createReducer(null, {
    [SET_SIDEBAR_OPEN]: (state, action) => action.payload,
  }),
  expandedSections: createReducer(Map(), {
    [SET_SECTION_EXPANDED]: (state, {payload: expanded, meta: {section}}) => state.set(section, expanded),
  })
})

