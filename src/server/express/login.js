// @flow

import bcrypt from 'bcrypt'
import promisify from 'es6-promisify'
import requireEnv from '@jcoreio/require-env'
import jwt from 'jsonwebtoken'
import type {$Request, $Response} from 'express'

import User from '../models/User'

const JWT_SECRET = requireEnv('JWT_SECRET')
const ROOT_URL = requireEnv('ROOT_URL')

export default async function login(req: $Request, res: $Response): Promise<void> {
  const {username, password} = req.body
  const user = await User.findOne({where: {username}})
  if (!user) {
    res.status(401).json({error: 'Invalid username or password'})
    return
  }
  const matches = await promisify(cb => bcrypt.compare(password, user.password, cb))()
  if (!matches) {
    res.status(401).json({error: 'Invalid username or password'})
    return
  }
  const token = await promisify(cb => jwt.sign(
    {
      userId: user.id,
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: '10h',
      issuer: ROOT_URL,
    },
    cb
  ))()
  res.status(200).json({token})
}

