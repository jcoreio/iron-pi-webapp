// @flow

import type {$Request, $Response} from 'express'

import createToken from '../auth/createToken'
import type {DecodedToken} from '../auth/DecodedToken'

async function createTestToken(req: $Request, res: $Response): Promise<void> {
  const {userId, scopes}: DecodedToken = (req: any)
  if (!scopes.has('test:create:token')) {
    res.status(403).json({error: 'forbidden'})
    return
  }

  const {expiresIn} = (req.body: any)
  const token = await createToken({userId, scopes: [...scopes], expiresIn})
  res.status(200).json({token})
}

module.exports = createTestToken
