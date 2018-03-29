/* global browser */

import waitForNotExist from './waitForNotExist'
import requireEnv from '@jcoreio/require-env'
import graphql from './graphql'

type Options = {
  password: string,
  updatePasswordFirst?: boolean,
}

export default async function login({password, updatePasswordFirst}: Options = {password: requireEnv('TEST_PASSWORD')}) {
  browser.timeouts('implicit', 500)
  if (updatePasswordFirst !== false) await graphql({
    query: `mutation prepare($password: String!) {
      updateUser(where: {username: "root"}, values: {password: $password, passwordHasBeenSet: true}) {
        id
      }
    }`,
    variables: {password},
  })
  await browser.setValue('#loginForm [name="password"]', password)
  await browser.click('#loginForm button[type="submit"]')
  await waitForNotExist('body #loginForm', 30000)
}

