/* @flow */

import {createStore, applyMiddleware} from 'redux'
import reducer from '../../universal/redux/reducer'
import {State} from '../../universal/redux/types'
import type {Store} from '../../universal/redux/types'
import {createMiddleware, composeMiddleware} from 'mindfront-redux-utils'
import {loadFeatureMiddleware, featureMiddlewaresMiddleware} from 'redux-features'
import {symmetryMiddleware} from '../../universal/redux/symmetry'
import type {Symmetry} from '../../universal/redux/symmetry'
import { routerMiddleware } from 'react-router-redux'
import { createMemoryHistory } from 'react-router'

type Options = {
  symmetry: Symmetry,
}

export default (initialState: State, {symmetry}: Options): Store => {
  return createStore(
    reducer,
    initialState,
    applyMiddleware(
      loadFeatureMiddleware({createMiddleware}),
      featureMiddlewaresMiddleware({composeMiddleware}),
      symmetryMiddleware(symmetry),
      routerMiddleware(createMemoryHistory())
    )
  )
}

