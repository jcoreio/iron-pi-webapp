/* global browser */

export default async function login(username, password) {
  await browser.setValue('[name="username"]', username)
  await browser.setValue('[name="password"]', password)
  await browser.click('[type="submit"]')
  await browser.waitForExist('#login-form', 5000, false)
}

