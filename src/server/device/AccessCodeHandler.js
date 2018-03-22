// @flow

export default class AccessCodeHandler {
  _accessCode: ?string = null
  _testAccessCode: ?string = null

  setAccessCode(accessCode: string) {
    this._accessCode = accessCode
  }

  setTestAccessCode(accessCode: string) {
    if (process.env.BABEL_ENV === 'test') {
      this._testAccessCode = accessCode
    } else {
      throw new Error('Operation only allowed in test mode')
    }
  }

  async verifyAccessCode(accessCode: string): Promise<void> {
    const correctCode = process.env.BABEL_ENV === 'test' ? this._testAccessCode : this._accessCode
    if (!correctCode || (correctCode !== (accessCode || '').toUpperCase()))
      throw new Error('Incorrect access code')
  }
}

