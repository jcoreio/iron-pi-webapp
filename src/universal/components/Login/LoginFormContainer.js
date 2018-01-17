// @flow

import * as React from 'react'
import {reduxForm, SubmissionError} from 'redux-form'
import LoginForm from './LoginForm'
import type {Dispatch} from '../../redux/types'
import {login} from '../../auth/actions'

type Props = {
  handleSubmit: (onSubmit: (values: {password: string}) => Promise<void>) => (values: {password: string}) => void,
  submitting?: boolean,
  valid?: boolean,
  error?: any,
  dispatch: Dispatch,
}

class LoginFormContainer extends React.Component<Props> {
  handleSubmit = async (values: {password: string}): Promise<any> => {
    const {dispatch} = this.props
    if (__CLIENT__) {
      const {password} = values
      if (!password) throw new Error("missing password")
      const promise: Promise<void> = (dispatch(login({password})): any)
      return promise.catch((error: Error) => {
        if (/invalid .*password/i.test(error.message)) {
          throw new SubmissionError({password: 'Incorrect password'})
        }
        throw new SubmissionError({_error: error.message})
      })
    }
  }
  render(): React.Node {
    const {handleSubmit, ...props} = this.props
    return <LoginForm {...props} onSubmit={handleSubmit(this.handleSubmit)} />
  }
}

export default reduxForm({form: 'login'})(LoginFormContainer)

