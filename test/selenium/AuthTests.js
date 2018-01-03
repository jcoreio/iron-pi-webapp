/* global browser */

import {expect} from 'chai'
import navigateTo from "./util/navigateTo"
import poll from '@jcoreio/poll'
import loginIfNecessary from './util/loginIfNecessary'
import logoutIfNecessary from './util/logoutIfNecessary'

module.exports = () => {
  describe('Auth', function () {
    this.timeout(60000)

    beforeEach(() => {
      navigateTo('/')
      browser.timeouts('implicit', 1000)
    })

    it('handles logout', async function () {
      await loginIfNecessary()

      await browser.click('body #openUserMenuButton')
      await browser.click('body #logOutMenuItem')

      await poll(
        async () => {
          expect(await browser.isVisible('body #openUserMenuButton')).to.be.false
          expect(await browser.isVisible('body #loginForm')).to.be.true
        },
        50
      )
    })
  })
  describe('LoginForm', function () {
    beforeEach(() => {
      navigateTo('/')
      browser.timeouts('implicit', 1000)
    })

    it('displays correct initial text', async function () {
      this.timeout(15000)
      await logoutIfNecessary()
      expect(await browser.getText('body #loginDialogTitle')).to.equal('Log In')
      expect(await browser.getText('#loginForm [data-test-name="password"] > label')).to.equal('Password')
      expect(await browser.getText('#loginForm button[type="submit"]')).to.equal('LOG IN')
    })
    it('displays error if user tries to log in with incorrect password', async function () {
      this.timeout(15000)
      await logoutIfNecessary()

      await browser.setValue('#loginForm [name="password"]', 'wrong password')
      await browser.click('#loginForm button[type="submit"]')
      browser.timeouts('implicit', 50)
      await poll(
        async () => {
          expect(
            await browser.getText('#loginForm [data-test-name="password"] > p')
          ).to.equal('Incorrect password')
        },
        50
      )
    })
  })
}

