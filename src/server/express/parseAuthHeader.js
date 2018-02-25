// @flow

import type {$Request, $Response} from 'express'
import verifyToken from '../auth/verifyToken'

export default async function parseAuthHeader(req: $Request, res: $Response, next: Function): Promise<void> {
  const auth = req.get('authorization')
  const match = /^Bearer (.*)$/i.exec(auth || '')
  if (match) {
    const token = match[1]
    try {
      const {userId, scopes} = await verifyToken(token);
      (req: Object).userId = userId;
      (req: Object).scopes = scopes
    } catch (error) {
      if (/expired/i.test(error.message)) {
        error.message = 'Your session has expired; please log in again.'
      }
      error.statusCode = 403
      next(error)
      return
    }
  }
  next()
}

