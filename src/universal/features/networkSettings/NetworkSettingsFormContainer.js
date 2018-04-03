// @flow

import * as React from 'react'
import {reduxForm} from 'redux-form'
import {graphql} from 'react-apollo'
import {compose} from 'redux'
import gql from 'graphql-tag'
import NetworkSettingsForm from './NetworkSettingsForm'
import type {NetworkSettings} from '../../network-settings/NetworkSettingsCommon'

const query = gql(`query {
  settings: NetworkSettings {
    dhcpEnabled
    ipAddress
    netmask
    gateway
    dnsServers
  }
}`)

type Data = {
  loading: boolean,
  settings?: NetworkSettings,
  state?: NetworkSettings,
}

export type Props = {
  initialized?: boolean,
  submitting?: boolean,
  submitSucceeded?: boolean,
  submitFailed?: boolean,
  pristine?: boolean,
  error?: string,
  initialize: (values: ?NetworkSettings) => any,
  handleSubmit: (onSubmit: (values: NetworkSettings) => Promise<any>) => any,
  data: Data,
}

class NetworkSettingsFormContainer extends React.Component<Props> {
  componentDidMount() {
    const {data, initialize} = this.props
    if (!data) return
    const {loading, settings} = data
    if (!loading && settings) initialize(settings)
  }

  componentWillReceiveProps(nextProps: Props) {
    const {data, initialize, initialized, pristine} = nextProps
    if (!data) return
    const {loading, settings} = data
    if (!loading && settings && (!initialized || pristine)) initialize(settings)
  }

  render(): ?React.Node {
    return <NetworkSettingsForm {...this.props} />
  }
}

export default compose(
  graphql(query, {
    options: {
      errorPolicy: 'all',
    },
  }),
  reduxForm({form: 'NetworkSettings'})
)(NetworkSettingsFormContainer)


