// @flow

import randomstring from 'randomstring'

import Scope from '../models/Scope'
import requireEnv from '@jcoreio/require-env/lib/index'
import User from '../models/User'

export default async function seedDatabase(): Promise<void> {
  if (process.env.BABEL_ENV === 'test') {
    const username = requireEnv('TEST_USERNAME')
    const password = requireEnv('TEST_PASSWORD')
    if (!(await User.findOne({where: {username}}))) {
      await User.create({username, password})
    } else {
      await User.update({password}, {where: {username}, individualHooks: true})
    }
    const testUser = await User.findOne({where: {username}})
    if (testUser) {
      // $FlowFixMe
      await testUser.addScopes(await Scope.findAll({where: {id: [
        'test:create:token',
        'update:users',
      ]}}))
    }

    if (!(await User.findOne({where: {username: 'root'}}))) {
      await User.create({username: 'root', password})
    } else {
      await User.update({password}, {where: {username: 'root'}, individualHooks: true})
    }
  } else if (process.env.NODE_ENV === 'development') {
    if (!(await User.findOne({where: {username: 'root'}}))) {
      await User.create({
        username: 'root',
        password: 'correct horse battery staple',
        passwordHasBeenSet: true
      })
    }
  } else {
    if (!(await User.findOne({where: {username: 'root'}}))) {
      await User.create({
        username: 'root',
        password: randomstring.generate(24),
        passwordHasBeenSet: false
      })
    }
  }
}

