// @flow

import once from 'lodash.once'
import {randomBuffer} from 'secure-random'
import requireEnv from '@jcoreio/require-env'

import KeyValuePair from '../models/KeyValuePair'

const JWT_SECRET_KEY = 'jwtSecret'

export const getJWTSecret: () => Promise<string> = once(async () => {
  if (process.env.GENERATE_JWT_SECRET) {
    let jwtSecret = process.env.JWT_SECRET
    if (jwtSecret)
      return jwtSecret
    jwtSecret = await KeyValuePair.getValue(JWT_SECRET_KEY)
    if (jwtSecret)
      return jwtSecret
    jwtSecret = randomBuffer(16).toString('base64')
    await KeyValuePair.setValue(JWT_SECRET_KEY, jwtSecret)
    return jwtSecret
  } else {
    return requireEnv('JWT_SECRET')
  }
})
