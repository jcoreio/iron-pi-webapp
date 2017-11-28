// @flow

import express from 'express'
import type {$Request, $Response} from 'express'

const test = express.Router()

test.get('/', (req: $Request, res: $Response) => res.status(200).send('yes!'))

test.get('/env/:varname', (req: $Request, res: $Response) => {
  const {varname} = req.params
  if (!process.env.hasOwnProperty(varname)) {
    res.status(404).send(`process.env[${JSON.stringify(varname)}] does not exist`)
  } else {
    res.status(200).send(process.env[varname])
  }
})
test.get('*', (req: $Request, res: $Response) => res.status(404).send('Not Found'))

module.exports = test

