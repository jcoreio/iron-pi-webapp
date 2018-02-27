// @flow

import type {GraphQLFieldConfig, GraphQLOutputType} from 'graphql'
import * as graphql from 'graphql'
import type {GraphQLContext} from '../Context'
import User from '../../models/User'

type Options = {
  types: {[name: string]: GraphQLOutputType},
}

export default function setUsername({types}: Options): GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: types[User.name],
    args: {
      username: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
    },
    resolve: async (doc: any, {username}: Object, context: GraphQLContext): Promise<any> => {
      const {userId: id} = context
      if (!id) throw new graphql.GraphQLError('You must be logged in to change your username')
      const [numAffected] = await User.update({username}, {where: {id}})
      if (!numAffected) throw new graphql.GraphQLError('Failed to find a user with the given id')
      return await User.findOne({where: {id}})
    }
  }
}

