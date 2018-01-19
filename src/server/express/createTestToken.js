// @flow

import type {$Request, $Response} from 'express'

import createToken from '../auth/createToken'
import type {DecodedToken} from '../auth/DecodedToken'

async function createTestToken(req: $Request, res: $Response): Promise<void> {
  const {userId, scopes}: DecodedToken = (req: any)
  if (!Array.isArray(scopes) || scopes.indexOf('test:create:token')) {
    res.status(403).json({error: 'forbidden'})
    return
  }

  const {expiresIn} = req.body
  const token = await createToken({userId, scopes, expiresIn})
  res.status(200).json({token})
}

module.exports = createTestToken
