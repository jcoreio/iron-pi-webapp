// @flow

import CodedError from '../util/CodedError'
import logger from '../../universal/logger'

import type {SymmetryErr} from './types'

const log = logger('symmetry:validate')

export function toSymErr(err: any): SymmetryErr {
  let message, code
  if (err && typeof err === 'object') {
    message = err.message
    code = err.code
  } else if (err && typeof err === 'string') {
    message = err
  } else {
    log.error(Error(`got error object with unexpected type: ${typeof err}`).stack)
  }
  const errOut: SymmetryErr = {
    ...err,
    message: message || 'an unknown error occurred',
  }
  if (!code || typeof code !== 'string') delete errOut.code
  return errOut
}

export function fromSymErr(err: SymmetryErr): Error {
  let message, code
  if (err && typeof err === 'object') {
    message = err.message
    code = err.code && typeof err.code === 'string' ? err.code : undefined
  } else if (err && typeof err === 'string') {
    message = err
  }
  message = message || 'an unknown error occurred'
  let result = code ? new CodedError(code, message) : new Error(message)
  Object.assign((result: Object), err)
  return result
}

