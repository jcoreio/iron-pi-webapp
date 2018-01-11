// @flow
/* global browser */

const debug = require('debug')('loginIfNecessary')

import login from './login'
import type {Options} from './login'
import poll from '@jcoreio/poll'

export default async function loginIfNecessary(options?: Options): Promise<void> {
  browser.timeouts('implicit', 500)
  debug('checking...')
  await poll(
    async ({fail}: any) => {
      if (await browser.isVisible('body #openUserMenuButton')) {
        debug('already logged in')
        return
      }
      else if (await browser.isVisible('body #loginForm')) {
        debug('logging in...')
        return login(options).then(
          () => debug('logged in'),
          (error: Error) => {
            debug('Login failed: ', error.message)
            throw error
          }
        )
      }
      else throw new Error('retrying')
    },
    500
  ).timeout(30000)
}

