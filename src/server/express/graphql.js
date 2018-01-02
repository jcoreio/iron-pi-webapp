import type {$Request, $Response} from 'express'
import type {Context} from '../graphql/schema'
import {graphqlExpress} from "apollo-server-express"
import type Sequelize from 'sequelize'
import type {GraphQLSchema} from 'graphql'

type Options = {
  sequelize: Sequelize,
  schema: GraphQLSchema,
}

export default function handleGraphql({sequelize, schema}: Options): (req: $Request, res: $Response, next: Function) => any {
  return graphqlExpress((req: $Request) => {
    const {userId} = (req: Object)
    const context: Context = {
      userId,
      sequelize,
    }
    return {
      schema,
      context,
    }
  })
}

