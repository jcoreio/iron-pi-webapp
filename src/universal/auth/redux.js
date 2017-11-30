// @flow

import {Set, List} from 'immutable'
import type {Map} from 'immutable'
import type {Reducer} from 'redux'
import {createReducer} from 'mindfront-redux-utils'

import type {LoginResponse} from './types'

// Redux actions and reducers for user auth.  See authMiddleware for the
// code that calls the server when a login action is dispatched

export type UserProfile = {
  fname: string,
  lname: string,
  email?: ?string,
}

type UserGroup = Map<string, any> // maybe use a record later?
type Policy = Map<string, any> // maybe use a record later?

export type User = {
  id: number,
  username: string,
  profile: UserProfile,
  userGroups: List<UserGroup>,
  policies: List<Policy>,
  roles: Set<string>,
}

export type AuthStatus = 'LOGGED_IN' | 'LOGGED_OUT' | 'LOGGING_IN' | 'LOGGING_OUT'
export const LOGGED_IN = 'LOGGED_IN'
export const LOGGED_OUT = 'LOGGED_OUT'
export const LOGGING_IN = 'LOGGING_IN'
export const LOGGING_OUT = 'LOGGING_OUT'

export type Auth = {
  status: AuthStatus,
  error: ?Error,
}

export const authInit: Auth = {
  status: LOGGED_OUT,
  error: null,
}

export const UPDATE_USER = 'UPDATE_USER'
export const LOGIN_WITH_PASSWORD = 'LOGIN_WITH_PASSWORD'
export const LOGIN_WITH_TOKEN = 'LOGIN_WITH_TOKEN'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAILURE = 'LOGIN_FAILURE'
export const LOGOUT = 'LOGOUT'
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE'

export type LoginWithPasswordAction = {
  type: 'LOGIN_WITH_PASSWORD',
  payload: {
    username: string,
    password: string,
  },
}

export function loginWithPassword(username: string, password: string): LoginWithPasswordAction {
  return {
    type: LOGIN_WITH_PASSWORD,
    payload: {username, password}
  }
}

export type LoginWithTokenAction = {
  type: 'LOGIN_WITH_TOKEN',
  payload: string,
}

export function loginWithToken(token: string): LoginWithTokenAction {
  return {
    type: LOGIN_WITH_TOKEN,
    payload: token,
  }
}

export type LoginSuccessAction = {
  type: 'LOGIN_SUCCESS',
  payload: LoginResponse,
}

export function loginSuccess(response: LoginResponse): LoginSuccessAction {
  return {
    type: LOGIN_SUCCESS,
    payload: response,
  }
}

export type LoginFailureAction = {
  type: 'LOGIN_FAILURE',
  error: true,
  payload: Error,
}

export function loginFailure(error: Error): LoginFailureAction {
  return {
    type: LOGIN_FAILURE,
    error: true,
    payload: error,
  }
}

export type LogoutAction = {
  type: 'LOGOUT',
}

export function logout(): LogoutAction {
  return {type: LOGOUT}
}

export type LogoutSuccessAction = {
  type: 'LOGOUT_SUCCESS',
}

export function logoutSuccess(): LogoutSuccessAction {
  return {type: LOGOUT_SUCCESS}
}

export type LogoutFailureAction = {
  type: 'LOGOUT_FAILURE',
  payload: Error,
}

export function logoutFailure(payload: Error): LogoutFailureAction {
  return {type: LOGOUT_FAILURE, payload}
}

export type UpdateUserAction = {
  type: 'UPDATE_USER',
  payload: User,
}

export function updateUser(payload: User): UpdateUserAction {
  return {type: UPDATE_USER, payload}
}

type AuthAction =
  LoginWithPasswordAction |
  LoginWithTokenAction |
  LoginSuccessAction |
  LoginFailureAction |
  LogoutAction |
  LogoutFailureAction |
  LogoutSuccessAction |
  UpdateUserAction

export const userReducer: Reducer<?User, AuthAction> = createReducer({
  [UPDATE_USER]: (state, {payload}) => payload ? payload : state,
  [LOGIN_WITH_PASSWORD]: () => null,
  // This used to clear the user when logging in with token, but I disabled it so that
  // the UI doesn't log out while logging back in as part of the reconnection process
  // [LOGIN_WITH_TOKEN]: () => null,
  [LOGIN_SUCCESS]: (state, {payload: {user}}) => user,
  [LOGIN_FAILURE]: () => null,
  [LOGOUT]: () => null,
  [LOGOUT_SUCCESS]: () => null,
})

export const authReducer: Reducer<?Auth, AuthAction> = createReducer(authInit, {
  [LOGIN_WITH_PASSWORD]: () => ({
    status: LOGGING_IN,
    error: null,
  }),
  [LOGIN_WITH_TOKEN]: () => ({
    status: LOGGING_IN,
    error: null,
  }),
  [LOGIN_SUCCESS]: (state: Auth) => ({
    status: LOGGED_IN,
    error: null,
  }),
  [LOGIN_FAILURE]: (state: Auth, {payload}: LoginFailureAction) => ({
    status: LOGGED_OUT,
    error: payload,
  }),
  [LOGOUT]: () => ({
    status: LOGGING_OUT,
    error: null
  }),
  [LOGOUT_SUCCESS]: () => ({
    status: LOGGED_OUT,
    error: null,
  }),
  [LOGOUT_FAILURE]: (state: Auth, {payload}: LogoutFailureAction) => ({
    status: LOGGED_IN,
    error: payload,
  }),
})

