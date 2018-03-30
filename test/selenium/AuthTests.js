/* global browser */

import {expect} from 'chai'
import graphql from './util/graphql'
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

  async function canLoginWithPassword(password: string): Promise<void> {
    const {body: {token}} = await superagent.post('/login').type('json').accept('json').send({
      username: 'root',
      password,
    })
    expect(token).to.exist
  }

  async function waitForLoggedIn(timeout: number = 10000): Promise<void> {
    await browser.waitForVisible('body #openUserMenuButton', timeout)
  }

  describe('Auth', function () {
    this.timeout(60000)

    beforeEach(async () => {
      await graphql({query: `mutation {
        updateUser(where: {username: "root"}, values: {passwordHasBeenSet: true}) {
          id
        }
        setInConnectMode(inConnectMode: false)
      }`})
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
  describe('ResetPasswordForm', function () {
    beforeEach(async () => {
      await navigateTo('/')
    })

    const waitForStep = (step: number): Promise<void> => poll(
      async () => expect(
        await browser.getText('#resetPasswordForm [data-test-name="stepNumber"]')
      ).to.match(new RegExp(`Step\\s+${step}\\s+of\\s+3`)),
      50
    ).timeout(5000)

    it('initial set password workflow works', async function () {
      this.timeout(60000)
      browser.timeouts('implicit', 1000)
      await logoutIfNecessary()
      const accessCode = 'ABCDEFGH'
      const oldPassword = requireEnv('TEST_PASSWORD')
      const newPassword = requireEnv('TEST_PASSWORD') + 'test'
      await graphql({
        query: `mutation prepare($accessCode: String!, $oldPassword: String!) {
          updateUser(where: {username: "root"}, values: {passwordHasBeenSet: false, password: $oldPassword}) {
            id
          }
          setInConnectMode(inConnectMode: false)
          setTestAccessCode(accessCode: $accessCode)
        }`,
        variables: {accessCode, oldPassword},
      })

      expect(await browser.getText('body #loginDialogTitle')).to.equal('jcore.io\nIRON PI')
      expect(await browser.getText('#resetPasswordForm [data-test-name="title"]')).to.equal('Set Password')
      await waitForStep(1)
      expect(await browser.isVisible('#resetPasswordForm [data-test-name="pressConnectButtonMessage"]'))
      await graphql({query: `mutation {
        setInConnectMode(inConnectMode: true)
      }`})

      await waitForStep(2)
      await browser.setValue('#resetPasswordForm [name="accessCode"]', accessCode)
      await browser.click('#resetPasswordForm button[type="submit"]')

      await waitForStep(3)
      await browser.setValue('#resetPasswordForm [name="newPassword"]', newPassword)
      await browser.setValue('#resetPasswordForm [name="retypeNewPassword"]', newPassword)
      await browser.click('#resetPasswordForm button[type="submit"]')

      await waitForLoggedIn(10000)
      await canLoginWithPassword(newPassword)
    })
    it('reset password workflow works', async function () {
      this.timeout(60000)
      browser.timeouts('implicit', 1000)
      await logoutIfNecessary()
      const accessCode = 'ABCDEFGH'
      const oldPassword = requireEnv('TEST_PASSWORD')
      const newPassword = oldPassword + 'test'
      await graphql({
        query: `mutation prepare($accessCode: String!, $oldPassword: String!) {
          updateUser(where: {username: "root"}, values: {passwordHasBeenSet: true, password: $oldPassword}) {
            id
          }
          setInConnectMode(inConnectMode: false)
          setTestAccessCode(accessCode: $accessCode)
        }`,
        variables: {accessCode, oldPassword},
      })

      expect(await browser.getText('body #loginDialogTitle')).to.equal('jcore.io\nIRON PI')
      await browser.click('=Forgot Password?')
      await waitForStep(1)
      expect(await browser.isVisible('#resetPasswordForm [data-test-name="pressConnectButtonMessage"]'))
      await graphql({query: `mutation {
        setInConnectMode(inConnectMode: true)
      }`})

      await waitForStep(2)
      await browser.setValue('#resetPasswordForm [name="accessCode"]', accessCode)
      await browser.click('#resetPasswordForm button[type="submit"]')

      await waitForStep(3)
      await browser.setValue('#resetPasswordForm [name="newPassword"]', newPassword)
      await browser.setValue('#resetPasswordForm [name="retypeNewPassword"]', newPassword)
      await browser.click('#resetPasswordForm button[type="submit"]')

      await waitForLoggedIn(10000)
      await canLoginWithPassword(newPassword)
    })
    it('requires correct access code', async function () {
      this.timeout(60000)
      browser.timeouts('implicit', 1000)
      await logoutIfNecessary()
      const accessCode = 'ABCDEFGH'
      await graphql({
        query: `mutation prepare($accessCode: String!) {
          updateUser(where: {username: "root"}, values: {passwordHasBeenSet: false}) {
            id
          }
          setInConnectMode(inConnectMode: true)
          setTestAccessCode(accessCode: $accessCode)
        }`,
        variables: {accessCode},
      })

      await waitForStep(2)
      await browser.setValue('#resetPasswordForm [name="accessCode"]', accessCode.substring(1))
      await browser.click('#resetPasswordForm button[type="submit"]')

      expect(
        await browser.getText('#resetPasswordForm [data-name="accessCode"] [data-component="FormHelperText"]')
      ).to.equal('Incorrect access code')
    })
  })
  describe('LoginDialog', function () {
    beforeEach(async () => {
      await graphql({query: `mutation {
        updateUser(where: {username: "root"}, values: {passwordHasBeenSet: true}) {
          id
        }
        setInConnectMode(inConnectMode: false)
      }`})
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
    beforeEach(async () => {
      await graphql({
        query: `mutation prepare($password: String!) {
          updateUser(where: {username: "root"}, values: {passwordHasBeenSet: true, password: $password}) {
            id
          }
          setInConnectMode(inConnectMode: false)
        }`,
        variables: {password: requireEnv('TEST_PASSWORD')}
      })
    })

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

      await canLoginWithPassword(requireEnv('TEST_PASSWORD'))
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

      await canLoginWithPassword(requireEnv('TEST_PASSWORD'))
    })
    // it('applies password strength requirements to new password', async function () {
    //   this.timeout(60000)
    //   await navigateTo('/changePassword')
    //   await loginIfNecessary()
    //
    //   const newPassword = 'blah'
    //
    //   await browser.setValue('#changePasswordForm [name="oldPassword"]', requireEnv('TEST_PASSWORD'))
    //   await browser.setValue('#changePasswordForm [name="newPassword"]', newPassword)
    //   await browser.setValue('#changePasswordForm [name="retypeNewPassword"]', newPassword)
    //   await browser.click('#changePasswordForm button[type="submit"]')
    //
    //   await poll(
    //     async () => {
    //       expect(
    //         await browser.getText('#changePasswordForm [data-test-name="newPassword"] [data-component="FormHelperText"]')
    //       ).to.match(/Add another word or two. Uncommon words are better/)
    //     },
    //     50
    //   ).timeout(10000)
    //
    //   await canLoginWithPassword(requireEnv('TEST_PASSWORD'))
    // })
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

      await canLoginWithPassword(newPassword)
    })
  })
}

