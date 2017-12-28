// @flow

import {createSelector} from 'reselect'
import type {State} from '../redux/types'

const selectIsWide = createSelector(
  (state: State) => state.windowSize.width,
  (windowWidth: ?number): boolean => {
    return windowWidth != null && windowWidth >= 768
  }
)

export default selectIsWide
