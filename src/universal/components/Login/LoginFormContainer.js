// @flow

import * as React from 'react'
import {reduxForm, SubmissionError} from 'redux-form/immutable'
import LoginForm from './LoginForm'
import login from '../../../client/auth/login'

type Props = {
  handleSubmit: (onSubmit: (values: Map<string, any>) => Promise<void>) => (values: Map<string, any>) => void,
  submitting?: boolean,
  valid?: boolean,
  error?: any,
}

class LoginFormContainer extends React.Component<Props> {
  handleSubmit = (values: Map<string, any>) => {
    const password = values.get('password')
    if (!password) throw new Error("missing password")
    return login({password}).catch((error: Error) => {
      if (/invalid .*password/i.test(error.message)) {
        throw new SubmissionError({password: 'Incorrect password'})
      }
      throw new SubmissionError({_error: error.message})
    })
  }
  render(): React.Node {
    const {handleSubmit, ...props} = this.props
    return <LoginForm {...props} onSubmit={handleSubmit(this.handleSubmit)} />
  }
}

export default reduxForm({form: 'login'})(LoginFormContainer)

