// @flow

import child_process from 'child_process'
import promisify from 'es6-promisify'

const exec = promisify(child_process.exec)

export default class SSHHandler {
  async isSSHEnabled(): Promise<boolean> {
    return 'enabled' === await exec('systemctl is-enabled ssh')
  }

  async setSSHEnabled(enabled: boolean): Promise<void> {
    if (enabled !== await this.isSSHEnabled()) {
      await exec(`systemctl ${enabled ? 'enable' : 'disable'} ssh`)
      await exec(`systemctl ${enabled ? 'start' : 'stop'} ssh`)
    }
  }

  async setSystemPassword(password: string): Promise<void> {
    if (!password || typeof password !== 'string') throw new Error('password must be a non empty string')
    await exec(`echo "pi:${password}" | chpasswd`)
  }
}
