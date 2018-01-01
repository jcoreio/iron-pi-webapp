// @flow

import jwt from 'jsonwebtoken'
import promisify from 'es6-promisify'
import requireEnv from '@jcoreio/require-env'
import type {$Request, $Response} from 'express'
import User from '../models/User'

const ROOT_URL = requireEnv('ROOT_URL')
const JWT_SECRET = requireEnv('JWT_SECRET')

export default async function authorize(req: $Request, res: $Response, next: Function): Promise<void> {
  const auth = req.get('authorization')
  const match = /^Bearer (.*)$/i.exec(auth || '')
  if (match) {
    const token = match[1]
    const decoded = await promisify(cb => jwt.verify(
      token,
      JWT_SECRET,
      {
        issuer: ROOT_URL,
      },
      cb
    ))()

    const {userId: id} = decoded
    ;(req: Object).user = await User.findOne({where: {id}})
  }
  next()
}

