// @flow

import type {GraphQLFieldConfig} from 'graphql'
import {ValidationError} from 'sequelize'
import * as graphql from 'graphql'
import bcrypt from 'bcrypt'
import promisify from 'es6-promisify'
import type {GraphQLContext} from '../GraphQLContext'
import User from '../../models/User'

type Args = {
  accessCode?: string,
  oldPassword?: string,
  newPassword: string,
}

export default function changePassword(): GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: graphql.GraphQLBoolean,
    args: {
      accessCode: {
        type: graphql.GraphQLString,
      },
      oldPassword: {
        type: graphql.GraphQLString,
      },
      newPassword: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
    },
    resolve: async (doc: any, {accessCode, oldPassword, newPassword}: Args, context: GraphQLContext): Promise<any> => {
      const {userId: id, connectModeHandler, accessCodeHandler, sshHandler} = context
      let user: ?User
      if (connectModeHandler.inConnectMode && accessCode) {
        try {
          await accessCodeHandler.verifyAccessCode(accessCode)
        } catch (err) {
          const {message} = err
          const error = new Error(message);
          (error: any).validation = {
            errors: [{path: ['accessCode'], message}]
          }
          throw error
        }
        user = await User.findOne({where: {username: 'root'}})
      } else {
        if (!oldPassword) {
          throw new Error('You must provide the old password unless you provide the accessCode in connect mode')
        }
        if (!id) throw new Error('You must be logged in to change your password')
        const fetchedUser = user = await User.findOne({where: {id}})
        if (!fetchedUser) throw new Error('User not found')
        const matches = await promisify(cb => bcrypt.compare(oldPassword, fetchedUser.password, cb))()
        if (!matches) {
          const error = new Error('Incorrect password');
          (error: any).validation = {
            errors: [{path: ['oldPassword'], message: 'Incorrect password'}]
          }
          throw error
        }
      }
      if (!user) throw new Error('User not found')
      try {
        await user.update({password: newPassword, passwordHasBeenSet: true}, {individualHooks: true})
        if (process.env.SET_SYSTEM_PASSWORD) await sshHandler.setSystemPassword(newPassword)
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

