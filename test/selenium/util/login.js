/* global browser */

import waitForNotExist from './waitForNotExist'
import requireEnv from '@jcoreio/require-env'

type Options = {
  password: string,
}

export default async function login({password}: Options = {password: requireEnv('TEST_PASSWORD')}) {
  browser.timeouts('implicit', 500)
  await browser.setValue('#loginForm [name="password"]', password)
  await browser.click('#loginForm button[type="submit"]')
  await waitForNotExist('body #loginForm', 30000)
}

