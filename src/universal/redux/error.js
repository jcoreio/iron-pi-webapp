import Record from './Record'
import {createReducer} from 'mindfront-redux-utils'

const errorInit = {
  header: "Oops!",
  message: "An unexpected error occurred.",
}

export class Error extends Record(errorInit) {
  header: string
  message: string
}

export const SET_ERROR = 'SET_ERROR'

export type SetErrorAction = {
  type: string,
  payload: Error
}

export function setError(error: Error): SetErrorAction {
  return {
    type: SET_ERROR,
    payload: error,
  }
}

export const errorReducer = createReducer(new Error(), {
  [SET_ERROR]: (state, {payload}) => payload
})
