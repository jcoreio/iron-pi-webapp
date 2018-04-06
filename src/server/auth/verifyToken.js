// @flow

import jwt from 'jsonwebtoken'
import promisify from 'es6-promisify'
import requireEnv from '@jcoreio/require-env'
import {getJWTSecret} from './jwtSecretHandler'
import type {DecodedToken} from './DecodedToken'

export default async function verifyToken(token: string): Promise<DecodedToken> {
  const jwtSecret = await getJWTSecret()
  const ROOT_URL = requireEnv('ROOT_URL')

  const {userId, scopes}: DecodedToken = await promisify(cb => jwt.verify(
    token,
    jwtSecret,
    {
      issuer: ROOT_URL,
    },
    cb
  ))()

  return {
    userId,
    scopes: new Set(scopes),
  }
}
