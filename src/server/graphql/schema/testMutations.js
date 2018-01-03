// @flow

import type {Options} from './index'
import User from '../../models/User'
import * as graphql from 'graphql'

export default function testMutations(options: Options): Object {
  return {
    ensureTestUser: {
      type: graphql.GraphQLBoolean,
      args: {
        password: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString),
        },
      },
      resolve: async (obj: any, {password}: {password: string}) => {
        if (!(await User.findOne({where: {username: 'root'}}))) {
          await User.create({username: 'root', password})
        } else {
          await User.update({password}, {where: {username: 'root'}, individualHooks: true})
        }
      }
    }
  }
}

