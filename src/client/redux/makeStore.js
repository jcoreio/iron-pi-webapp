/* @flow */

import { createStore, compose, applyMiddleware } from 'redux'
import {createMiddleware, composeMiddleware} from 'mindfront-redux-utils'
import {loadFeatureMiddleware, featureMiddlewaresMiddleware} from 'redux-features'

import reducer from '../../universal/redux/reducer'
import type {Store, Middleware, State, Action} from '../../universal/redux/types'
import type SymmetryClient from '../symmetry/SymmetryClient'
import {symmetryMiddleware} from '../../universal/redux/symmetry'
import symmetryReconnectMiddleware from '../symmetry/symmetryReconnectMiddleware'

type Options = {
  symmetry: SymmetryClient,
}

export default (initialState: State, {symmetry}: Options): Store => {
  const middlewares: Array<Middleware> = [
    loadFeatureMiddleware({createMiddleware}),
    featureMiddlewaresMiddleware({composeMiddleware}),
    symmetryMiddleware(symmetry),
    symmetryReconnectMiddleware(symmetry),
  ]

  // istanbul ignore next
  if (process.env.LOG_REDUX_ACTIONS || (!window.devToolsExtension &&
    process.env.NODE_ENV !== 'production' && process.env.BABEL_ENV !== 'test')) {
    // We don't have the Redux extension in the browser, show the Redux logger
    const {createLogger} = require('redux-logger')
    middlewares.push(createLogger({
      level: 'info',
      actionTransformer(action: Action): any {
        if (action.type === 'BATCHING_REDUCER.BATCH') {
          const types = action.payload.slice(0, 3).map(a => a.type)
          if (action.payload.length > 10) types.push('...')
          const result = action.payload
          result.type = `[${types.join(', ')}]`
          return action.payload
        }

        return action
      },
      collapsed: (getState, action, logEntry) => !logEntry.error,
    }))
  }

  // istanbul ignore next
  if (process.env.NODE_ENV !== 'production') {
    const devtoolsExt = window.devToolsExtension && window.devToolsExtension()
    const store = createStore(reducer, initialState, compose(
      // composeMiddleware improves efficiency
      applyMiddleware(composeMiddleware(...middlewares)),
      devtoolsExt || ((f: any): any => f)
    ))
    if (module.hot instanceof Object) {
      module.hot.accept('../../universal/redux/reducer', (require: Function) => {
        const newReducer = require('../../universal/redux/reducer')
        store.replaceReducer(newReducer)
      })
    }
    return store
  }

  // composeMiddleware improves efficiency
  return createStore(reducer, initialState, applyMiddleware(composeMiddleware(...middlewares)))
}
