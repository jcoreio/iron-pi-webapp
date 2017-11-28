// @flow

import {createHash} from 'crypto'

export default (password: string): string =>
  createHash('sha256').update(password).digest('base64')
