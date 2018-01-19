// @flow

import promisify from 'es6-promisify'
import requireEnv from '@jcoreio/require-env'
import jwt from 'jsonwebtoken'

const JWT_SECRET = requireEnv('JWT_SECRET')
const ROOT_URL = requireEnv('ROOT_URL')

type Request = {
  userId: number,
  expiresIn: string,
  scopes?: Array<string>,
}

export default async function createToken({userId, scopes, expiresIn}: Request): Promise<string> {
  return await promisify(cb => jwt.sign(
    {
      userId,
      scopes: scopes || [],
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn,
      issuer: ROOT_URL,
    },
    cb
  ))()
}

