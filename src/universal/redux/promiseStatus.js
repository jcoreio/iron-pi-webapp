// @flow

import {createReducer} from 'mindfront-redux-utils'
import type {Reducer} from 'redux'
import type {Dispatch} from './types'

export const RESET = 'RESET'
export const SET_PENDING = 'SET_PENDING'
export const RESOLVE = 'RESOLVE'
export const REJECT = 'REJECT'

export type PromiseStatus<Result> = {
  pending: boolean,
  resolved: boolean,
  rejected: boolean,
  result: ?Result,
  error: ?Error,
  message: ?string,
}

export const initialPromiseStatus: PromiseStatus<any> = {
  pending: false,
  resolved: false,
  rejected: false,
  result: null,
  error: null,
  message: null,
}

export type ResetAction = {
  type: string,
  payload: {message: ?string},
}
export type SetPendingAction = {
  type: string,
  payload: {message: ?string},
}
export type ResolveAction<Result> = {
  type: string,
  payload: {
    result: Result,
    message: ?string,
  }
}
export type RejectAction = {
  type: string,
  error: boolean,
  payload: {
    error: Error,
    message: ?string,
  }
}

export type PromiseStatusAction<Result> = ResetAction | SetPendingAction | ResolveAction<Result> | RejectAction

export type PromiseStatusActions<Result> = {
  reset: (message?: string) => ResetAction,
  setPending: (message?: string) => SetPendingAction,
  resolve: (result: Result, message?: string) => ResolveAction<Result>,
  reject: (error: Error, message?: string) => RejectAction,
}

export function promiseStatusActions<Result>(typePrefix: string = ''): PromiseStatusActions<Result> {
  return {
    reset(message?: string): ResetAction {
      return {
        type: typePrefix + RESET,
        payload: {message}
      }
    },
    setPending(message?: string): SetPendingAction {
      return {
        type: typePrefix + SET_PENDING,
        payload: {message}
      }
    },
    resolve(result: Result, message?: string): ResolveAction<Result> {
      return {
        type: typePrefix + RESOLVE,
        payload: {result, message},
      }
    },
    reject(error: Error, message?: string): RejectAction {
      return {
        type: typePrefix + REJECT,
        error: true,
        payload: {error, message},
      }
    },
  }
}

export function defaultLoadingMessages(what: string): {
  pending: string,
  resolved: string,
  rejected: string,
} {
  return {
    pending: `Loading ${what}...`,
    resolved: `Loaded ${what}.`,
    rejected: `Failed to load ${what}:`,
  }
}

export type ReducerOptions = {
  defaultMessages?: $Shape<{
    reset: string,
    pending: string,
    resolved: string,
    rejected: string,
  }>,
}

export type PromiseStatusReducer<Result> = Reducer<PromiseStatus<Result>, PromiseStatusAction<Result>>

export function promiseStatusReducer<Result>(
  typePrefix: string = '',
  options: ReducerOptions = {}
): PromiseStatusReducer<Result> {
  const defaultMessages = options.defaultMessages || {}
  return createReducer(initialPromiseStatus, {
    [typePrefix + RESET]: (state, {payload: {message}}) => ({
      pending: false,
      resolved: false,
      rejected: false,
      result: null,
      error: null,
      message: message || defaultMessages.reset,
    }),
    [typePrefix + SET_PENDING]: (state, {payload: {message}}) => ({
      pending: true,
      resolved: false,
      rejected: false,
      result: null,
      error: null,
      message: message || defaultMessages.pending,
    }),
    [typePrefix + RESOLVE]: (state, {payload: {result, message}}) => ({
      pending: false,
      resolved: true,
      rejected: false,
      result,
      error: null,
      message: message || defaultMessages.resolved,
    }),
    [typePrefix + REJECT]: (state, {payload: {error, message}}) => ({
      pending: false,
      resolved: false,
      rejected: true,
      result: null,
      error,
      message: message || defaultMessages.rejected,
    }),
  })
}

export function syncPromiseStatus<Result>(
  dispatch: Dispatch,
  promise: Promise<Result>,
  actions: PromiseStatusActions<Result>,
  {resetDelay}: {
    resetDelay?: number,
  } = {}
): Promise<Result> {
  dispatch(actions.setPending())
  return (promise
      .then((result: Result) => {
        dispatch(actions.resolve(result))
        if (resetDelay) setTimeout(() => dispatch(actions.reset()), resetDelay)
        return result
      })
      .catch((error: Error) => {
        dispatch(actions.reject(error))
        if (resetDelay) setTimeout(() => dispatch(actions.reset()), resetDelay)
        throw error
      })
  )
}

