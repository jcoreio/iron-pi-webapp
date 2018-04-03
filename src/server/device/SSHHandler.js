// @flow

import child_process from 'child_process'
import promisify from 'es6-promisify'

const exec = promisify(child_process.exec)

export interface SSHHandler {
  isSSHEnabled(): Promise<boolean>;
  setSSHEnabled(enabled: boolean): Promise<void>;
  setSystemPassword(password: string): Promise<void>;
}

export default class DeviceSSHHandler implements SSHHandler {
  async isSSHEnabled(): Promise<boolean> {
    try {
      const status = await exec('systemctl is-enabled ssh')
      return typeof status === 'string' && 'enabled' === status.trim()
    } catch (err) {
      // When ssh is not enabled, the command returns 1
      if (err.code === 1) return false
      throw err
    }
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

