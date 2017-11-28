// @flow

import type {Reducer} from 'redux'
import {createReducer} from 'mindfront-redux-utils'
import {OrderedSet} from 'immutable'
import type {Set} from 'immutable'

export const ADD = 'ADD'
export const CLEAR = 'CLEAR'
export const REMOVE = 'REMOVE'
export const TOGGLE = 'TOGGLE'

export type SetAction<E> = {
  type: string,
  payload: Iterable<E>,
}

export type ClearAction = {
  type: string,
}

export type SetActions<E> = {
  add: (payload: Iterable<E>) => SetAction<E>,
  remove: (payload: Iterable<E>) => SetAction<E>,
  toggle: (payload: Iterable<E>) => SetAction<E>,
  clear: () => ClearAction,
}

export function setActions<E>(actionTypePrefix: string): SetActions<E> {
  return {
    add(payload: Iterable<E>): SetAction<E> {
      return {
        type: actionTypePrefix + ADD,
        payload,
      }
    },
    remove(payload: Iterable<E>): SetAction<E> {
      return {
        type: actionTypePrefix + REMOVE,
        payload,
      }
    },
    toggle(payload: Iterable<E>): SetAction<E> {
      return {
        type: actionTypePrefix + TOGGLE,
        payload,
      }
    },
    clear(): ClearAction {
      return {
        type: actionTypePrefix + CLEAR,
      }
    }
  }
}

export function setReducer<E>(actionTypePrefix: string): Reducer<Set<E>, SetAction<E>> {
  return createReducer(OrderedSet(), {
    [actionTypePrefix + CLEAR]: (set: Set<E>) => set.clear(),
    [actionTypePrefix + ADD]: (set: Set<E>, {payload}: SetAction<E>) => set.union(payload),
    [actionTypePrefix + REMOVE]: (set: Set<E>, {payload}: SetAction<E>) => set.subtract(payload),
    [actionTypePrefix + TOGGLE]: (set: Set<E>, {payload}: SetAction<E>) => set.withMutations((set: Set<any>) => {
      for (let elem of payload) {
        if (set.has(elem)) set.remove(elem)
        else set.add(elem)
      }
    }),
  })
}

// TODO: create parseElement

export function parseSet<E>(json: Iterable<E>): Set<E> {
  return OrderedSet(json)
}

