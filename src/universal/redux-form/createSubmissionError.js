// @flow

import set from 'lodash.set'
import size from 'lodash.size'
import {SubmissionError} from 'redux-form'

export default function createSubmissionError(err: {message: string, graphQLErrors?: Array<any>}) {
  const {graphQLErrors} = err
  const submitErrors = {}
  if (graphQLErrors) {
    for (let error of graphQLErrors) {
      const {validation} = error
      const {errors} = validation || {}
      if (errors) {
        for (let {path, message} of errors) {
          set(submitErrors, path, message)
        }
      }
    }
  }
  if (!size(submitErrors)) submitErrors._error = err.message
  throw new SubmissionError(submitErrors)
}

