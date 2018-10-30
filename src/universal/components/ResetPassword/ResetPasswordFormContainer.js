// @flow

import * as React from 'react'
import {withRouter} from 'react-router-dom'
import type {RouterHistory} from 'react-router-dom'
import {reduxForm} from 'redux-form'
import {compose} from 'redux'
import gql from 'graphql-tag'
import {graphql} from 'react-apollo'
import ResetPasswordForm from './ResetPasswordForm'
import handleError from '../../redux-form/createSubmissionError'

type Data = {
  inConnectMode?: boolean,
}

export type Props = {
  history: RouterHistory,
  title?: React.Node,
  verifyAccessCode: (options: {variables: {accessCode: string}}) => any,
  changePassword: (options: {variables: {accessCode: string, newPassword: string}}) => any,
  handleSubmit: (handler: (values: {accessCode: string, newPassword: string}) => Promise<any>) => (event: Event) => any,
  subscribeToInConnectMode: () => any,
  data: Data,
  submitting: boolean,
  error?: string,
  showCancelButton?: boolean,
  afterPasswordChanged?: (newPassword: string) => any,
}

type State = {
  step: 1 | 2 | 3,
}

class ResetPasswordFormContainer extends React.Component<Props, State> {
  state: State = {step: this.props.data.inConnectMode ? 2 : 1}

  componentDidMount() {
    this.props.subscribeToInConnectMode()
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.data.inConnectMode !== this.props.data.inConnectMode) {
      if (nextProps.data.inConnectMode) {
        if (this.state.step === 1) this.setState({step: 2})
      } else {
        this.setState({step: 1})
      }
    }
  }

  handleSubmit = async (values: {accessCode: string, newPassword: string}): Promise<any> => {
    const {verifyAccessCode, changePassword, afterPasswordChanged} = this.props
    const {accessCode, newPassword} = values
    const {step} = this.state
    switch (step) {
    case 2: {
      await verifyAccessCode({variables: {accessCode}}).catch(handleError)
      this.setState({step: 3})
      break
    }
    case 3: {
      await changePassword({variables: {accessCode, newPassword}}).catch(handleError)
      if (afterPasswordChanged) afterPasswordChanged(newPassword)
      break
    }
    }
  }

  handleCancel = () => {
    const {history} = this.props
    history.goBack()
  }

  render(): ?React.Node {
    const {title, handleSubmit, submitting, error, showCancelButton} = this.props
    const {step} = this.state
    return (
      <ResetPasswordForm
        title={title}
        step={step}
        onCancel={this.handleCancel}
        onSubmit={handleSubmit(this.handleSubmit)}
        submitting={submitting}
        error={error}
        showCancelButton={showCancelButton}
      />
    )
  }
}

export default compose(
  withRouter,
  graphql(gql(`query { inConnectMode }`), {
    props: props => ({
      ...props,
      subscribeToInConnectMode: () => props.data.subscribeToMore({
        document: gql(`subscription { inConnectMode }`),
        updateQuery: (prev: Data, update: {subscriptionData: {errors?: Array<Error>, data?: Data}}): Data => {
          const {subscriptionData: {data}} = update
          if (!data) return prev
          const {inConnectMode} = data
          return {
            ...prev,
            inConnectMode,
          }
        }
      }),
    })
  }),
  graphql(gql(`mutation verifyAccessCode($accessCode: String!) {
    verifyAccessCode(accessCode: $accessCode) 
  }`), {name: 'verifyAccessCode'}),
  graphql(gql(`mutation changePassword($accessCode: String!, $newPassword: String!) {
    changePassword(accessCode: $accessCode, newPassword: $newPassword) 
  }`), {name: 'changePassword'}),
  reduxForm({form: 'resetPassword'})
)(ResetPasswordFormContainer)
