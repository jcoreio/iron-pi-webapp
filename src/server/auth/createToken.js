// @flow

import promisify from 'es6-promisify'
import requireEnv from '@jcoreio/require-env'
import jwt from 'jsonwebtoken'

const JWT_SECRET = requireEnv('JWT_SECRET')
const ROOT_URL = requireEnv('ROOT_URL')

type Request = {
  userId: number,
}

export default async function createToken({userId}: Request): Promise<string> {
  return await promisify(cb => jwt.sign(
    {
      userId,
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: '10h',
      issuer: ROOT_URL,
    },
    cb
  ))()
}

