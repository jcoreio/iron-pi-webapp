// @flow

import {fromJS} from 'immutable'
import {Map} from 'immutable'
import Record from './Record'
import {routerReducer} from 'react-router-redux'
import {reducer as formReducer} from 'redux-form/immutable'
import {featuresReducer, featureStatesReducer} from 'redux-features'
import type {Features, FeatureStates} from 'redux-features'
import {initialPromiseState} from 'redux-track-promise'
import type {PromiseState} from 'redux-track-promise'
import type {ConnectionState} from './symmetry'
import {initialConnectionState} from './symmetry'
import {Error} from './error'

import {User, parseUser, Auth} from '../auth/redux'
import type {UserJSON} from '../auth/redux'

import type {
  Store as _Store,
  Reducer as _Reducer,
  Dispatch as _Dispatch,
  Middleware as _Middleware,
  MiddlewareAPI as _MiddlewareAPI,
} from 'redux'

// Some things can be rendered on the client but not the server.
// But the client must initially render the same thing the server did,
// or React will warn that there was a checksum error.
// So first the client renders in the same mode as the server did, and
// then it sets the renderMode to 'client' to trigger rendering of
// everything that can only be rendered on the client.
export type RenderMode = 'prerender' | 'client'

const stateInit = {
  features: (featuresReducer()((undefined: any), {type: ''}): Features<State, Action>),
  featureStates: (featureStatesReducer()((undefined: any), {type: ''}): FeatureStates),
  router: (routerReducer(undefined, {}): Object),
  renderMode: ('prerender': RenderMode),
  form: (formReducer(undefined, {}): Map<string, any>),
  error: new Error(),
  user: (null: ?User),
  auth: new Auth(),
  connection: initialConnectionState,
}
export type StateFields = typeof stateInit

export class State extends Record(stateInit) {
  features: Features<State, Action>
  featureStates: FeatureStates
  user: ?User
  auth: Auth
  router: Object
  renderMode: RenderMode
  form: Map<string, any>
  error: Error
  connection: ConnectionState
}


export type StateJSON = {
  features: Features<State, Action>,
  featureStates: FeatureStates,
  user: ?UserJSON,
  auth: Auth,
  router: Object,
  renderMode: RenderMode,
  form: Object,
  error: Object,
  connection: ConnectionState,
}

export function parseState({
  user, auth, form,
  ...fields,
}: StateJSON): State {
  return new State({
    user: user ? parseUser(user) : null,
    auth: new Auth(auth),
    form: fromJS(form || {}),
    ...fields,
  })
}

export type Action = $Shape<{
  type: $Subtype<string>,
  error: boolean,
  payload: any,
  meta: Object,
}>

export type Store = _Store<State, Action>
export type Dispatch = _Dispatch<Action>
export type Reducer = _Reducer<State, Action>
export type Middleware = _Middleware<State, Action>
export type MiddlewareAPI = _MiddlewareAPI<State, Action>

