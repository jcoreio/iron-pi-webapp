// @flow

import * as React from 'react'
import {reduxForm} from 'redux-form'
import {graphql} from 'react-apollo'
import {compose} from 'redux'
import gql from 'graphql-tag'
import NetworkSettingsForm from './NetworkSettingsForm'
import type {NetworkSettings} from '../../network-settings/NetworkSettingsCommon'
import handleError from '../../redux-form/createSubmissionError'

const query = gql(`query {
  settings: NetworkSettings {
    dhcpEnabled
    ipAddress
    netmask
    gateway
    dnsServers
  }
  state: NetworkState {
    dhcpEnabled
    ipAddress
    netmask
    gateway
    dnsServers
  }
}`)

const mutation = gql(`mutation setSettings($settings: InputNetworkSettings!) {
  setNetworkSettings(settings: $settings)
}`)

type Data = {
  loading: boolean,
  settings?: NetworkSettings,
  state?: NetworkSettings,
  refetch: () => any,
}

export type Props = {
  initialized?: boolean,
  submitting?: boolean,
  submitSucceeded?: boolean,
  submitFailed?: boolean,
  pristine?: boolean,
  error?: string,
  initialize: (values: ?NetworkSettings, options?: {keepSubmitSucceeded?: boolean}) => any,
  handleSubmit: (onSubmit: (values: NetworkSettings) => Promise<any>) => any,
  setNetworkSettings: (options: {variables: {settings: NetworkSettings}}) => Promise<any>,
  data: Data,
}

function pickFormFields(settings: NetworkSettings): NetworkSettings {
  const {dhcpEnabled, ipAddress, netmask, gateway, dnsServers} = settings
  return {dhcpEnabled, ipAddress, netmask, gateway, dnsServers}
}

class NetworkSettingsFormContainer extends React.Component<Props> {
  _initialize(props: Props = this.props) {
    const {data, initialize, submitting} = props
    if (!data) return
    const {loading, settings} = data
    if (!loading && !submitting && settings) initialize(pickFormFields(settings))
  }

  componentDidMount() {
    this._initialize()
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const {initialized} = nextProps
    if (!initialized) this._initialize(nextProps)
  }

  _handleSubmit = (settings: NetworkSettings): Promise<any> => {
    const {setNetworkSettings, initialize} = this.props
    return setNetworkSettings({variables: {settings}}).then(
      () => initialize(settings, {keepSubmitSucceeded: true}),
      handleError,
    )
  }

  _handleCancel = () => {
    this._initialize()
  }

  _handleRefresh = () => {
    const {data} = this.props
    if (data) data.refetch()
  }

  render(): ?React.Node {
    const {initialized, submitting, submitSucceeded, submitFailed, pristine, error, handleSubmit, data} = this.props
    return (
      <NetworkSettingsForm
        initialized={initialized}
        submitting={submitting}
        submitSucceeded={submitSucceeded}
        submitFailed={submitFailed}
        pristine={pristine}
        error={error}
        onSubmit={handleSubmit(this._handleSubmit)}
        onCancel={this._handleCancel}
        onRefresh={this._handleRefresh}
        data={data}
      />
    )
  }
}

export default compose(
  graphql(query, {
    options: {
      errorPolicy: 'all',
    },
  }),
  graphql(mutation, {
    name: 'setNetworkSettings',
    options: {
      refetchQueries: [
        {query}
      ]
    }
  }),
  reduxForm({form: 'NetworkSettings'})
)(NetworkSettingsFormContainer)


