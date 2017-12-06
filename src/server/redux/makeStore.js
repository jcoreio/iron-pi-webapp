/* @flow */

import {createStore, applyMiddleware} from 'redux'
import reducer from '../../universal/redux/reducer'
import type {State} from '../../universal/redux/types'
import type {Store} from '../../universal/redux/types'
import {createMiddleware, composeMiddleware} from 'mindfront-redux-utils'
import {loadFeatureMiddleware, featureMiddlewaresMiddleware} from 'redux-features'

export default (initialState: State): Store => {
  return createStore(
    reducer,
    initialState,
    applyMiddleware(
      loadFeatureMiddleware({createMiddleware}),
      featureMiddlewaresMiddleware({composeMiddleware}),
    )
  )
}

