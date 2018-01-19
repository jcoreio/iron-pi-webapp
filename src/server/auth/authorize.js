// @flow

import bcrypt from 'bcrypt'
import promisify from 'es6-promisify'

import User from '../models/User'
import createToken from './createToken'

type Request = {
  username: string,
  password: string,
}

export default async function authorize({username, password}: Request): Promise<string> {
  const user = await User.findOne({
    where: {username},
    include: [{association: User.Scopes}],
  })
  if (!user) {
    throw new Error('Invalid username or password')
  }
  const matches = await promisify(cb => bcrypt.compare(password, user.password, cb))()
  if (!matches) {
    throw new Error('Invalid username or password')
  }
  const scopes = user.Scopes && user.Scopes.map(scope => scope.id) || []
  return await createToken({userId: user.id, scopes, expiresIn: '1d'})
}

