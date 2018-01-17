// @flow

import {set} from 'lodash'
import {SubmissionError} from 'redux-form'

export default function createSubmissionError(err: {message: string, graphQLErrors?: Array<any>}) {
  const {graphQLErrors} = err
  const submitErrors = {}
  if (graphQLErrors) {
    for (let error of graphQLErrors) {
      const {validation} = error
      const {errors} = validation || {}
      for (let {path, message} of errors) {
        set(submitErrors, path, message)
      }
    }
  } else {
    submitErrors._error = err.message
  }
  throw new SubmissionError(submitErrors)
}

