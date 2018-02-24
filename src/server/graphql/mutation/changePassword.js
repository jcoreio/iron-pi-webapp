// @flow

import type {GraphQLFieldConfig} from 'graphql'
import {ValidationError} from 'sequelize'
import * as graphql from 'graphql'
import bcrypt from 'bcrypt'
import promisify from 'es6-promisify'
import type {Context} from '../Context'
import User from '../../models/User'

type Args = {
  oldPassword: string,
  newPassword: string,
}

export default function changePassword(): GraphQLFieldConfig<any, Context> {
  return {
    type: graphql.GraphQLBoolean,
    args: {
      oldPassword: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
      newPassword: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
    },
    resolve: async (doc: any, {oldPassword, newPassword}: Args, context: Context): Promise<any> => {
      const {userId: id} = context
      if (!id) throw new graphql.GraphQLError('You must be logged in to change your password')
      const user = await User.findOne({where: {id}})
      if (!user) throw new Error('User not found')
      const matches = await promisify(cb => bcrypt.compare(oldPassword, user.password, cb))()
      if (!matches) {
        const error = new Error('Incorrect password');
        (error: any).validation = {
          errors: [{path: ['oldPassword'], message: 'Incorrect password'}]
        }
        throw error
      }
      try {
        await user.update({password: newPassword, passwordHasBeenSet: true}, {individualHooks: true})
      } catch (error) {
        if (error instanceof ValidationError) {
          const passwordItem = error.errors.find(item => item.path === 'password')
          if (passwordItem) passwordItem.path = 'newPassword'
        }
        throw error
      }
    }
  }
}

