/* global browser */

import {expect} from 'chai'
import login from './util/login'
import drilldownTransitionsDone from './util/drilldownTransitionsDone'
import superagent from 'superagent'
import navigateTo from "./util/navigateTo"
import rootUrl from "./util/rootUrl"
import waitUntil from './util/waitUntil'

describe('UsersView', () => {
  beforeEach(() => browser.timeouts('implicit', 5000))
  it('shows list of existing users', async function () {
    await superagent.post(rootUrl() + '/__test__/call/createUser')
      .send({
        username: 'andy',
        password: 'password',
        disabled: false,
        profile: {
          fname: 'Andy',
          lname: 'Edwards',
        }
      })
    await navigateTo('/admin/users')
    await login('admin', '@dmin123')
    expect(await browser.getText('.CollectionView-rows > .list-group-item')).to.deep.equal([
      'Administrator',
      'Andy Edwards',
    ])
  })
  describe('UserView', () => {
    it('create user', async function () {
      await navigateTo('/admin/users')
      await login('admin', '@dmin123')
      await browser.click('[href="/admin/users/create"]')
      await drilldownTransitionsDone()

      const password = 'ln1283;lkja9sdfikj2$'

      await browser.setValue('[name="username"]', 'jimbob')
      await browser.setValue('[name="profile.fname"]', 'Jim')
      await browser.setValue('[name="profile.lname"]', 'Bob')
      await browser.setValue('[name="profile.email"]', 'jim@bob.com')
      await browser.setValue('[name="password"]', password)
      await browser.setValue('[name="retypePassword"]', password)

      await browser.click('[type="submit"]')
      await browser.waitForVisible('.list-group-item=Jim Bob', 15000)
    })
    it('update user', async function () {
      await superagent.post(rootUrl() + '/__test__/call/createUser')
        .send({
          username: 'andy',
          password: 'password',
          disabled: false,
          profile: {
            fname: 'Andy',
            lname: 'Edwards',
            email: 'jedwards@fastmail.com',
          }
        })
      await navigateTo('/admin/users')
      await login('admin', '@dmin123')
      await browser.click('=Andy Edwards')
      await drilldownTransitionsDone()

      await browser.setValue('[name="profile.fname"]', 'Andork')

      await browser.click('[type="submit"]')
      await browser.waitForVisible('=Andork Edwards', 15000)
    })
    it('delete user', async function () {
      await superagent.post(rootUrl() + '/__test__/call/createUser')
        .send({
          username: 'andy',
          password: 'password',
          disabled: false,
          profile: {
            fname: 'Andy',
            lname: 'Edwards',
            email: 'jedwards@fastmail.com',
          }
        })
      await navigateTo('/admin/users')
      await login('admin', '@dmin123')
      await browser.waitForVisible('.list-group-item', 15000)
      if (await browser.isVisible('.sidebar-btn')) await browser.click('.sidebar-btn')
      await browser.click('=Andy Edwards')
      await drilldownTransitionsDone()
      await browser.waitForVisible('h2=Andy Edwards Profile', 15000)

      await browser.click('#delete-entity-btn')
      await browser.click('.btn-danger=Delete')
      await drilldownTransitionsDone()
      await browser.waitForVisible('h2=Users', 15000)
      await waitUntil(
        async () => {
          const users = await browser.getText('.CollectionView-rows > .list-group-item')
          return users === 'Administrator' || (users.length === 1 && users[0] === 'Administrator')
        },
        15000,
        'expected Andy Edwards to disappear from users list within 5s'
      )
    })
  })
})

