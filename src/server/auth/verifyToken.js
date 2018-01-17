// @flow

import jwt from 'jsonwebtoken'
import promisify from 'es6-promisify'
import requireEnv from '@jcoreio/require-env'
import type {DecodedToken} from './DecodedToken'
import User from '../models/User'

const JWT_SECRET = requireEnv('JWT_SECRET')
const ROOT_URL = requireEnv('ROOT_URL')

export default async function verifyToken(token: string): Promise<DecodedToken> {
  const decoded: DecodedToken = await promisify(cb => jwt.verify(
    token,
    JWT_SECRET,
    {
      issuer: ROOT_URL,
    },
    cb
  ))()

  if (!(await User.findOne({where: {id: decoded.userId}}))) {
    throw new Error('Invalid userId')
  }

  return decoded
}

