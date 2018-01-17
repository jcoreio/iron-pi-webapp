/* @flow */

import {createStore, applyMiddleware} from 'redux'
import reducer from '../../universal/redux/reducer'
import type {Action, Dispatch, MiddlewareAPI, State} from '../../universal/redux/types'
import type {Store} from '../../universal/redux/types'
import {createMiddleware, composeMiddleware} from 'mindfront-redux-utils'
import {loadFeatureMiddleware, featureMiddlewaresMiddleware, LOAD_FEATURE} from 'redux-features'

type Options = {
  featurePromises?: Array<Promise<void>>,
}

export default (initialState: State, options?: Options = {}): Store => {
  const featurePromises = options.featurePromises || []
  return createStore(
    reducer,
    initialState,
    applyMiddleware(
      (store: MiddlewareAPI) => (next: Dispatch) => (action: Action) => {
        const result = next(action)
        if (action.type === LOAD_FEATURE) featurePromises.push((result: any))
        return result
      },
      loadFeatureMiddleware({createMiddleware}),
      featureMiddlewaresMiddleware({composeMiddleware}),
    )
  )
}

