// @flow

import type {SSHHandler} from './SSHHandler'

export default class TestSSHHandler implements SSHHandler {
  _sshEnabled: boolean = true

  async isSSHEnabled(): Promise<boolean> {
    return this._sshEnabled
  }

  async setSSHEnabled(sshEnabled: boolean): Promise<void> {
    this._sshEnabled = sshEnabled
  }

  async setSystemPassword(password: string): Promise<void> {
  }
}
