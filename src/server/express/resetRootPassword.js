// @flow

import type {$Request, $Response} from 'express'
import requireEnv from '@jcoreio/require-env'
import User from '../models/User'

async function resetRootPassword(req: $Request, res: $Response): Promise<void> {
  const password = requireEnv('TEST_PASSWORD')
  await User.update({password}, {where: {username: 'root'}, individualHooks: true})
  res.status(200).send()
}

module.exports = resetRootPassword

