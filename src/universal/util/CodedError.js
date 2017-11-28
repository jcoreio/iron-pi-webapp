// @flow

import ExtendableError from 'es6-error'

export default class CodedError extends ExtendableError {

  code: ?string;

  constructor(code: ?string, message: string) {
    super(message)
    this.code = code
  }

}
