// @flow

import delay from 'delay'

export default class AccessCodeHandler {
  _testAccessCode: ?string = null

  setTestAccessCode(accessCode: string) {
    if (process.env.BABEL_ENV === 'test') {
      this._testAccessCode = accessCode
    } else {
      throw new Error('Operation only allowed in test mode')
    }
  }

  async verifyAccessCode(accessCode: string): Promise<void> {
    await delay(1000)
    if (process.env.BABEL_ENV === 'test') {
      if (accessCode !== this._testAccessCode) throw new Error('Incorrect access code')
    } else {
      throw new Error('Hardware access code verification not implemented yet')
    }
  }
}

