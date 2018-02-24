// @flow

import * as React from 'react'
import type {RouterHistory} from 'react-router-dom'
import {reduxForm} from 'redux-form'
import {compose} from 'redux'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import ChangePasswordForm from './ChangePasswordForm'
import handleError from '../../redux-form/createSubmissionError'

type Values = {oldPassword: string, newPassword: string}

type Props = {
  history: RouterHistory,
  handleSubmit: (onSubmit: (values: Values) => Promise<void>) => (values: Values) => void,
  submitting?: boolean,
  valid?: boolean,
  error?: any,
  mutate: (options: {variables: Values}) => Promise<any>,
}

class ChangePasswordFormContainer extends React.Component<Props> {
  handleSubmit = async (values: Values): Promise<any> => {
    const {mutate, history} = this.props
    if (__CLIENT__) {
      const {oldPassword, newPassword} = values
      const promise: Promise<void> = mutate({variables: {oldPassword, newPassword}})
      return promise.then(() => {
        history.goBack()
      }).catch(handleError)
    }
  }
  handleCancel = () => {
    const {history} = this.props
    history.goBack()
  }
  render(): React.Node {
    const {handleSubmit, ...props} = this.props
    return <ChangePasswordForm {...props} onCancel={this.handleCancel} onSubmit={handleSubmit(this.handleSubmit)} />
  }
}

export default compose(
  graphql(gql(`mutation changePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword)
  }`)),
  reduxForm({form: 'changePassword'})
)(ChangePasswordFormContainer)

