// @flow

import type {$Request, $Response} from 'express'

import User from '../models/User'
import createToken from '../auth/createToken'

async function createTestToken(req: $Request, res: $Response): Promise<void> {
  const {expiresIn} = req.body
  const user = await User.findOne({where: {username: 'root'}})
  if (!user) {
    res.status(500).json({error: 'root user not found'})
    return
  }
  const userId = user.id
  const token = await createToken({userId, expiresIn})
  res.status(200).json({token})
}

module.exports = createTestToken
