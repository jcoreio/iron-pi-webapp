// @flow

import type {$Request, $Response} from 'express'
import {graphiqlExpress} from "apollo-server-express"

type Options = {
  endpointURL: string,
}

export default function handleGraphiql({endpointURL}: Options): (req: $Request, res: $Response, next: Function) => any {
  return async (req: $Request, res: $Response, next: Function) => {
    graphiqlExpress({
      endpointURL,
    })(req, res, next)
  }
}

