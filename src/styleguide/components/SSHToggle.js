import * as React from 'react'
import _SSHToggle from '../../universal/features/securityView/SSHToggle'

export default class SSHToggle extends React.Component {
  state = {sshEnabled: false}
  _handleChange = sshEnabled => this.setState({sshEnabled})
  render(): ?React.Node {
    return <_SSHToggle {...this.state} onChange={this._handleChange} />
  }
}

