// @flow

import type {$Request, $Response} from 'express'
import type {GraphQLContext, GraphQLDependencies} from '../graphql/GraphQLContext'
import {graphqlExpress} from "apollo-server-express"
import type {GraphQLSchema} from 'graphql'

type Options = GraphQLDependencies & {
  schema: GraphQLSchema,
}

export default function handleGraphql({
  schema, ...dependencies
}: Options): (req: $Request, res: $Response, next: Function) => any {
  return graphqlExpress((req: $Request) => {
    const context: GraphQLContext = {
      ...dependencies
    }
    return {
      schema,
      context,
    }
  })
}

