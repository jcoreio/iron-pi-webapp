// @flow
/* global browser */

import poll from '@jcoreio/poll'

export default async function logoutIfNecessary(): Promise<void> {
  browser.timeouts('implicit', 500)
  await poll(
    async ({fail}: any) => {
      if (await browser.isVisible('body #openUserMenuButton')) {
        await browser.click('body #openUserMenuButton').catch(fail)
        await browser.click('body #logOutMenuItem').catch(fail)
      }
      else if (await browser.isVisible('body #loginForm')) return
      else if (await browser.isVisible('body #resetPasswordForm')) return
      else throw new Error('retrying')
    },
    500
  ).timeout(30000)
}

