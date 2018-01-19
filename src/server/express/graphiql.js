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
    const user = await User.findOne({
      where: {username: process.env.TEST_USERNAME || 'root'},
      include: [{association: User.Scopes}],
    })
    if (!user) {
      res.status(403).send("Error: failed to get user")
      return
    }
    const scopes = user.Scopes && user.Scopes.map(scope => scope.id) || []
    const token = await createToken({userId: user.id, scopes, expiresIn: '2d'})
    graphiqlExpress({
      endpointURL,
      passHeader: `'Authorization': 'Bearer ${token}'`,
    })(req, res, next)
  }
}

