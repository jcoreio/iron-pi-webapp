// @flow

import * as React from 'react'
import {graphql} from 'react-apollo'
import {compose} from 'redux'
import gql from 'graphql-tag'
import SSHToggle from './SSHToggle'

const query = gql(`query {
  sshEnabled
}`)

const mutation = gql(`mutation toggle($sshEnabled: Boolean!) {
  setSSHEnabled(sshEnabled: $sshEnabled)
}`)

type Data = {
  loading: boolean,
  sshEnabled?: boolean,
}

export type Props = {
  data: Data,
  setSSHEnabled: (options: {variables: {sshEnabled: boolean}}) => Promise<any>,
}

class SSHToggleContainer extends React.Component<Props> {
  _handleChange = (sshEnabled: boolean) => {
    const {setSSHEnabled} = this.props
    setSSHEnabled({variables: {sshEnabled}})
  }
  render(): ?React.Node {
    const {data} = this.props
    return (
      <SSHToggle
        sshEnabled={data && data.sshEnabled}
        onChange={this._handleChange}
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
    name: 'setSSHEnabled',
    options: {
      refetchQueries: [
        {query}
      ]
    }
  }),
)(SSHToggleContainer)


