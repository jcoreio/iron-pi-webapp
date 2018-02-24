/* global browser */

import {expect} from 'chai'
import navigateTo from "./util/navigateTo"
import poll from '@jcoreio/poll'
import requireEnv from '@jcoreio/require-env'
import loginIfNecessary from './util/loginIfNecessary'
import logoutIfNecessary from './util/logoutIfNecessary'
import superagent from './util/superagent'
import execute from './util/execute'
import delay from 'delay'

module.exports = () => {
  let token
  before(async () => {
    token = (await superagent.post('/login').type('json').accept('json').send({
      username: requireEnv('TEST_USERNAME'),
      password: requireEnv('TEST_PASSWORD'),
    })).body.token
  })
  beforeEach(async () => {
    await superagent.post('/resetRootPassword')
  })
  after(async () => {
    await superagent.post('/resetRootPassword')
  })

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
      expect(await browser.getText('#loginForm [data-name="password"] > label')).to.equal('Password')
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
            await browser.getText('#loginForm [data-name="password"] [data-component="FormHelperText"]')
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
        .set('Authorization', `Bearer ${token}`)
        .send({expiresIn: '3s'}))
      try {
        await execute(function (token) {
          /* eslint-env browser */
          localStorage.setItem('token', token)
        }, shortLivedToken)

        await delay(4000) // wait for token to expire
        await navigateTo('/')

        browser.timeouts('implicit', 250)
        await browser.waitForVisible('#loginForm [data-component="ErrorAlert"]', 15000)

        expect(await browser.getText('#loginForm [data-component="ErrorAlert"]')).to.equal(
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
        .set('Authorization', `Bearer ${token}`)
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
        await browser.waitForVisible('#loginForm [data-component="ErrorAlert"]', 15000)

        expect(await browser.getText('#loginForm [data-component="ErrorAlert"]')).to.equal(
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
  describe('ChangePasswordDialog', () => {
    it('displays error if old password is incorrect', async function () {
      this.timeout(60000)
      await navigateTo('/changePassword')
      await loginIfNecessary()

      const newPassword = 'semiscientific tribunal'

      await browser.setValue('#changePasswordForm [name="oldPassword"]', 'blah')
      await browser.setValue('#changePasswordForm [name="newPassword"]', newPassword)
      await browser.setValue('#changePasswordForm [name="retypeNewPassword"]', newPassword)
      await browser.click('#changePasswordForm button[type="submit"]')

      await poll(
        async () => {
          expect(
            await browser.getText('#changePasswordForm [data-test-name="oldPassword"] [data-component="FormHelperText"]')
          ).to.equal('Incorrect password')
        },
        50
      ).timeout(10000)

      const {body: {token}} = await superagent.post('/login').type('json').accept('json').send({
        username: 'root',
        password: requireEnv('TEST_PASSWORD'),
      })
      expect(token).to.exist
    })
    it('requires new passwords to match', async function () {
      this.timeout(60000)
      await navigateTo('/changePassword')
      await loginIfNecessary()

      await browser.setValue('#changePasswordForm [name="oldPassword"]', requireEnv('TEST_PASSWORD'))
      await browser.setValue('#changePasswordForm [name="newPassword"]', 'blah')
      await browser.setValue('#changePasswordForm [name="retypeNewPassword"]', 'blahb')
      await browser.setValue('#changePasswordForm [name="newPassword"]', 'blah')

      await poll(
        async () => {
          expect(
            await browser.getText('#changePasswordForm [data-test-name="retypeNewPassword"] [data-component="FormHelperText"]')
          ).to.match(/doesn't match `New Password`/)
        },
        50
      ).timeout(10000)

      const {body: {token}} = await superagent.post('/login').type('json').accept('json').send({
        username: 'root',
        password: requireEnv('TEST_PASSWORD'),
      })
      expect(token).to.exist
    })
    it('applies password strength requirements to new password', async function () {
      this.timeout(60000)
      await navigateTo('/changePassword')
      await loginIfNecessary()

      const newPassword = 'blah'

      await browser.setValue('#changePasswordForm [name="oldPassword"]', requireEnv('TEST_PASSWORD'))
      await browser.setValue('#changePasswordForm [name="newPassword"]', newPassword)
      await browser.setValue('#changePasswordForm [name="retypeNewPassword"]', newPassword)
      await browser.click('#changePasswordForm button[type="submit"]')

      await poll(
        async () => {
          expect(
            await browser.getText('#changePasswordForm [data-test-name="newPassword"] [data-component="FormHelperText"]')
          ).to.match(/Add another word or two. Uncommon words are better/)
        },
        50
      ).timeout(10000)

      const {body: {token}} = await superagent.post('/login').type('json').accept('json').send({
        username: 'root',
        password: requireEnv('TEST_PASSWORD'),
      })
      expect(token).to.exist
    })
    it('changes password successfully', async function () {
      this.timeout(60000)
      await navigateTo('/')
      await loginIfNecessary()
      await navigateTo('/changePassword')

      const newPassword = 'semiscientific tribunal'

      await browser.setValue('#changePasswordForm [name="oldPassword"]', requireEnv('TEST_PASSWORD'))
      await browser.setValue('#changePasswordForm [name="newPassword"]', newPassword)
      await browser.setValue('#changePasswordForm [name="retypeNewPassword"]', newPassword)
      await browser.click('#changePasswordForm button[type="submit"]')

      await poll(
        async () => {
          expect(await browser.isVisible('#changePasswordForm')).to.be.false
        },
        50
      ).timeout(10000)

      const {body: {token}} = await superagent.post('/login').type('json').accept('json').send({
        username: 'root',
        password: newPassword,
      })
      expect(token).to.exist
    })
  })
}

