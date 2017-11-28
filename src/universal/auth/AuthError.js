// @flow

import CodedError from '../util/CodedError'
import {CODE_UNAUTHORIZED} from './constants'

export default class AuthError extends CodedError {
  constructor(message: string = 'Unauthorized') {
    super(CODE_UNAUTHORIZED, message)
  }
}
