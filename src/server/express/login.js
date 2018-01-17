// @flow

import type {$Request, $Response} from 'express'

import authorize from '../auth/authorize'

export default async function login(req: $Request, res: $Response): Promise<void> {
  let token
  try {
    const {username, password} = req.body
    token = await authorize({username, password})
  } catch (error) {
    res.status(401).json({error: error.message})
    return
  }
  res.status(200).json({token})
}

