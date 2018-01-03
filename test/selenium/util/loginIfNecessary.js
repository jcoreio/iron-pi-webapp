// @flow
/* global browser */

import login from './login'
import type {Options} from './login'
import poll from '@jcoreio/poll'

export default async function loginIfNecessary(options?: Options): Promise<void> {
  browser.timeouts('implicit', 500)
  await poll(
    async ({fail}: any) => {
      if (await browser.isVisible('body #openUserMenuButton')) return
      else if (await browser.isVisible('body #loginForm')) return login(options).catch(fail)
      else throw new Error('retrying')
    },
    500
  ).timeout(30000)
}

