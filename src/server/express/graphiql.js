// @flow

import type {$Request, $Response} from 'express'
import {graphiqlExpress} from "apollo-server-express"
import User from '../models/User'
import createToken from '../auth/createToken'

type Options = {
  endpointURL: string,
}

export default function handleGraphiql({endpointURL}: Options): (req: $Request, res: $Response, next: Function) => any {
  return async (req: $Request, res: $Response, next: Function) => {
    const user = await User.findOne({username: 'root'})
    if (!user) {
      res.status(403).send("Error: failed to get root user")
      return
    }
    const token = await createToken({userId: user.id})
    graphiqlExpress({
      endpointURL,
      passHeader: `'Authorization': 'Bearer ${token}'`,
    })(req, res, next)
  }
}

