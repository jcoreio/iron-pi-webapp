// @flow

import type {$Request, $Response} from 'express'

export default function requireAuthHeader(req: $Request, res: $Response, next: Function) {
  const auth = req.get('authorization')
  const match = /^Bearer (.*)$/i.exec(auth || '')
  if (!match) {
    const error = new Error('missing authorization header')
    ;(error: any).statusCode = 400
    next(error)
  } else {
    next()
  }
}

