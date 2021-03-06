// @flow

import {createReducer, composeReducers} from 'mindfront-redux-utils'
import {combineReducers} from 'mindfront-redux-utils-immutable'
import {featuresReducer, featureStatesReducer, featureReducersReducer} from 'redux-features'
import {enableBatching} from 'redux-batched-actions'

import type {Reducer} from './types'
import {StateRecord} from './types'
import {renderModeReducer} from './renderMode'
import {reducer as form} from 'redux-form'
import {sidebarReducer} from './sidebar'
import {websocketReducer} from '../apollo/websocketRedux'

const reducer: Reducer = enableBatching(composeReducers(
  combineReducers({
    features: featuresReducer({createReducer}),
    featureStates: featureStatesReducer({createReducer}),
    renderMode: renderModeReducer,
    form,
    sidebar: sidebarReducer,
    websocket: websocketReducer,
  }, init => new StateRecord(init)),
  featureReducersReducer({composeReducers})
))

export default reducer

