// @flow

import * as React from 'react'
import {reduxForm, SubmissionError} from 'redux-form'
import LoginForm from './LoginForm'

type Props = {
  handleSubmit: (onSubmit: (values: {password: string}) => Promise<void>) => (values: {password: string}) => void,
  submitting?: boolean,
  valid?: boolean,
  error?: any,
}

class LoginFormContainer extends React.Component<Props> {
  handleSubmit = async (values: {password: string}): Promise<any> => {
    if (__CLIENT__) {
      const login = require('../../../client/auth/login').default

      const {password} = values
      if (!password) throw new Error("missing password")
      return login({password}).catch((error: Error) => {
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

