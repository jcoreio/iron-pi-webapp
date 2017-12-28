// @flow

import {createSelector} from 'reselect'
import type {State} from '../redux/types'
import selectIsWide from './selectIsWide'

const selectSidebarOpen = createSelector(
  (state: State) => state.sidebar.open,
  selectIsWide,
  (sidebarOpen: ?boolean, isWide: boolean): boolean => sidebarOpen != null ? sidebarOpen : isWide
)

export default selectSidebarOpen
