/* global browser */

import {expect} from 'chai'
import superagent from 'superagent'
import navigateTo from "./util/navigateTo"
import rootUrl from "./util/rootUrl"

describe('user auth', () => {
  it('displays error message when nonexistent user logs in', async function () {
    await navigateTo('/')
    await browser.setValue('[name="username"]', 'andy')
    await browser.setValue('[name="password"]', 'password')
    await browser.click('[type="submit"]')
    await browser.waitForVisible('.alert-danger', 1000)
    expect(await browser.getText('.alert-danger')).to.match(/Could not authenticate/i)
  })
  it('displays error message when user tries to log in with wrong password', async function () {
    await Promise.all([
      superagent.post(rootUrl() + '/__test__/call/createUser')
        .send({
          username: 'andy',
          password: 'password',
          disabled: false,
          profile: {
            fname: 'Andy',
            lname: 'Edwards',
          }
        }),
      navigateTo('/'),
    ])
    await browser.setValue('[name="username"]', 'andy')
    await browser.setValue('[name="password"]', 'blah')
    await browser.click('[type="submit"]')
    await browser.waitForVisible('.alert-danger', 1000)
    expect(await browser.getText('.alert-danger')).to.match(/Could not authenticate/i)
  })
  it('allows existing user to log in and log out', async function () {
    await Promise.all([
      superagent.post(rootUrl() + '/__test__/call/createUser')
        .send({
          username: 'andy',
          password: 'password',
          disabled: false,
          profile: {
            fname: 'Andy',
            lname: 'Edwards',
          }
        }),
      navigateTo('/'),
    ])
    await browser.setValue('[name="username"]', 'andy')
    await browser.setValue('[name="password"]', 'password')
    await browser.click('[type="submit"]')
    await browser.waitForVisible('=Andy Edwards', 10000)

    // test that automatic token login works
    await navigateTo('/')
    await browser.waitForVisible('=Andy Edwards', 10000)

    // test that logging out works
    await browser.moveToObject('=Andy Edwards')
    await browser.click('=Log out')
    await browser.waitForVisible('[name="username"]', 1000)
    expect(await browser.isExisting('=Andy Edwards')).to.be.false

    // test that automatic token login doesn't happen after logout
    await navigateTo('/')
    await browser.waitForVisible('[name="username"]', 1000)
  })
})

