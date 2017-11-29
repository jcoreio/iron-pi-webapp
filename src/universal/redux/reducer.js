// @flow

import {createReducer, composeReducers} from 'mindfront-redux-utils'
import {combineReducers} from 'mindfront-redux-utils-immutable'
import {featuresReducer, featureStatesReducer, featureReducersReducer} from 'redux-features'
import {enableBatching} from 'redux-batched-actions'

import type {Reducer} from './types'
import {State} from './types'
import {renderModeReducer} from './renderMode'
import {reducer as form} from 'redux-form/immutable'
import {userReducer, authReducer} from '../auth/redux'
import {connectionStateReducer} from './symmetry'
import {errorReducer} from './error'

const reducer: Reducer = enableBatching(composeReducers(
  combineReducers({
    features: featuresReducer({createReducer}),
    featureStates: featureStatesReducer({createReducer}),
    renderMode: renderModeReducer,
    form,
    error: errorReducer,
    auth: (authReducer: any),
    user: (userReducer: any),
    connection: connectionStateReducer,
  }, init => new State(init)),
  featureReducersReducer({composeReducers})
))

export default reducer

