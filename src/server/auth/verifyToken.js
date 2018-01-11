// @flow

import jwt from 'jsonwebtoken'
import promisify from 'es6-promisify'
import requireEnv from '@jcoreio/require-env'
import type {DecodedToken} from './DecodedToken'

const JWT_SECRET = requireEnv('JWT_SECRET')
const ROOT_URL = requireEnv('ROOT_URL')

const verifyToken: (token: string) => Promise<DecodedToken> = promisify((token, cb) => jwt.verify(
  token,
  JWT_SECRET,
  {
    issuer: ROOT_URL,
  },
  cb
))

export default verifyToken

