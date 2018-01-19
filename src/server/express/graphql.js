// @flow

import type {$Request, $Response} from 'express'
import type {Context} from '../graphql/Context'
import {graphqlExpress} from "apollo-server-express"
import type Sequelize from 'sequelize'
import type {GraphQLSchema} from 'graphql'
import formatError from '../graphql/formatError'

type Options = {
  sequelize: Sequelize,
  schema: GraphQLSchema,
}

export default function handleGraphql({sequelize, schema}: Options): (req: $Request, res: $Response, next: Function) => any {
  return graphqlExpress((req: $Request) => {
    const {userId, scopes} = (req: Object)
    const context: Context = {
      userId,
      scopes,
      sequelize,
    }
    return {
      schema,
      context,
      formatError,
    }
  })
}

