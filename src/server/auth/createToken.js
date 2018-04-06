// @flow

import promisify from 'es6-promisify'
import requireEnv from '@jcoreio/require-env'
import jwt from 'jsonwebtoken'

import {getJWTSecret} from './jwtSecretHandler'

type Request = {
  userId: number,
  expiresIn: string,
  scopes?: Array<string>,
}

export default async function createToken({userId, scopes, expiresIn}: Request): Promise<string> {
  const jwtSecret = await getJWTSecret()
  const ROOT_URL = requireEnv('ROOT_URL')

  return await promisify(cb => jwt.sign(
    {
      userId,
      scopes: scopes || [],
    },
    jwtSecret,
    {
      algorithm: 'HS256',
      expiresIn,
      issuer: ROOT_URL,
    },
    cb
  ))()
}

