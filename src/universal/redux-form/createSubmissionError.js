// @flow

import {SubmissionError} from 'redux-form'

export default function createSubmissionError(err: {message: string, graphQLErrors?: Array<any>}) {
  const {graphQLErrors} = err
  if (graphQLErrors) {
    for (let error of graphQLErrors) {
      const {submitErrors} = error
      if (submitErrors) throw new SubmissionError(submitErrors)
    }
  }
  throw new SubmissionError({_error: err.message})
}

