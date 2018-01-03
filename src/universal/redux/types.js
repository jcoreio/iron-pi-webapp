// @flow

import {Record} from 'immutable'
import type {RecordOf} from 'immutable'
import {reducer as formReducer} from 'redux-form'
import {featuresReducer, featureStatesReducer} from 'redux-features'
import type {Features, FeatureStates} from 'redux-features'

import type {
  Store as _Store,
  Reducer as _Reducer,
  Dispatch as _Dispatch,
  Middleware as _Middleware,
  MiddlewareAPI as _MiddlewareAPI,
} from 'redux'

import type {SidebarState, SidebarStateJSON} from './sidebar'
import {parseSidebarState, sidebarReducer} from './sidebar'

// Some things can be rendered on the client but not the server.
// But the client must initially render the same thing the server did,
// or React will warn that there was a checksum error.
// So first the client renders in the same mode as the server did, and
// then it sets the renderMode to 'client' to trigger rendering of
// everything that can only be rendered on the client.
export type RenderMode = 'prerender' | 'client'

export type StateFields = {
  features: Features<State, Action>,
  featureStates: FeatureStates,
  renderMode: RenderMode,
  form: {[form: string]: Object},
  sidebar: SidebarState,
}
const stateInit: StateFields = {
  features: featuresReducer()((undefined: any), {type: ''}),
  featureStates: featureStatesReducer()((undefined: any), {type: ''}),
  renderMode: 'prerender',
  form: formReducer(undefined, {type: ''}),
  sidebar: sidebarReducer(undefined, {type: ''}),
}

export const StateRecord = Record(stateInit)
export type State = RecordOf<StateFields>

export type StateJSON = {
  features: Features<State, Action>,
  featureStates: FeatureStates,
  renderMode: RenderMode,
  form: {[form: string]: Object},
  sidebar: SidebarStateJSON,
}

export function parseState({
  sidebar, ...fields
}: StateJSON): State {
  return StateRecord({
    sidebar: parseSidebarState(sidebar),
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

