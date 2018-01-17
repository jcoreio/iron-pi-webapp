/* global browser */

import {expect} from 'chai'
import navigateTo from "./util/navigateTo"
import poll from '@jcoreio/poll'
import loginIfNecessary from './util/loginIfNecessary'
import logoutIfNecessary from './util/logoutIfNecessary'
import superagent from './util/superagent'
import execute from './util/execute'
import delay from 'delay'

module.exports = () => {
  describe('Auth', function () {
    this.timeout(60000)

    beforeEach(async () => {
      await navigateTo('/')
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
  describe('LoginDialog', function () {
    beforeEach(async () => {
      await navigateTo('/')
      browser.timeouts('implicit', 1000)
    })

    it('displays correct initial text', async function () {
      this.timeout(15000)
      await logoutIfNecessary()
      expect(await browser.getText('body #loginDialogTitle')).to.equal('jcore.io\nIRON PI')
      expect(await browser.getText('#loginForm [data-test-name="password"] > label')).to.equal('Password')
      expect(await browser.getText('#loginForm button[type="submit"]')).to.equal('Log In')
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
    it('shows up if auth token is expired when page loads', async function () {
      this.timeout(60000)
      // create a token that expires in 3 seconds
      // (this route only exists in test mode)
      const {body: {token: shortLivedToken}} = (await superagent.post('/createTestToken')
        .type('json')
        .accept('json')
        .send({expiresIn: '3s'}))
      try {
        await execute(function (token) {
          /* eslint-env browser */
          localStorage.setItem('token', token)
        }, shortLivedToken)

        await delay(4000) // wait for token to expire
        await navigateTo('/')

        browser.timeouts('implicit', 250)
        await browser.waitForVisible('#loginForm [data-test-name="submitError"]', 15000)

        expect(await browser.getText('#loginForm [data-test-name="submitError"]')).to.equal(
          'Your session has expired; please log in again.'
        )
      } finally {
        await execute(function () {
          /* eslint-env browser */
          localStorage.removeItem('token')
        })
      }
    })
    it('shows up if graphql request fails because auth token expired', async function () {
      this.timeout(60000)
      await loginIfNecessary()
      // create a token that expires in 3 seconds
      // (this route only exists in test mode)
      const {body: {token: shortLivedToken}} = (await superagent.post('/createTestToken')
        .type('json')
        .accept('json')
        .send({expiresIn: '3s'}))
      try {
        await execute(function (token) {
          /* eslint-env browser */
          localStorage.setItem('token', token)
        }, shortLivedToken)

        await delay(4000) // wait for token to expire

        browser.timeouts('implicit', 1000)
        await browser.click('a[href="/channel/5"]')

        browser.timeouts('implicit', 250)
        await browser.waitForVisible('#loginForm [data-test-name="submitError"]', 15000)

        expect(await browser.getText('#loginForm [data-test-name="submitError"]')).to.equal(
          'Your session has expired; please log in again.'
        )
      } finally {
        await execute(function () {
          /* eslint-env browser */
          localStorage.removeItem('token')
        })
      }
    })
  })
}

