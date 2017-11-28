/* global browser */

import {expect} from 'chai'
import login from './util/login'
import drilldownTransitionsDone from './util/drilldownTransitionsDone'
import superagent from 'superagent'
import navigateTo from "./util/navigateTo"
import rootUrl from "./util/rootUrl"

describe('UserGroups', () => {
  it('is possible to add/remove a user to/from groups using the UI', async function () {
    this.timeout(90000)
    browser.timeouts('implicit', 1000)

    await superagent.post(rootUrl() + '/__test__/call/createUser')
      .send({
        username: 'jimbob',
        password: 'password',
      })
    await navigateTo('/admin/userGroups')
    await login('admin', '@dmin123')

    await browser.click('=Add User Group')
    await drilldownTransitionsDone()
    await browser.waitForVisible('h2=Create User Group', 5000)
    await browser.setValue('input[name="name"]', 'Jocks')
    await browser.submitForm('input[name="name"]')

    await drilldownTransitionsDone()
    await browser.click('=Add User Group')
    await drilldownTransitionsDone()
    await browser.waitForVisible('h2=Create User Group', 5000)
    await browser.setValue('input[name="name"]', 'Posers')
    await browser.submitForm('input[name="name"]')

    await browser.waitForVisible('=Jocks', 5000)
    await browser.waitForVisible('=Posers', 5000)

    await navigateTo('/admin/users')
    await browser.click('=jimbob')
    await drilldownTransitionsDone()
    await browser.waitForVisible('h2=jimbob Profile', 5000)
    await browser.click('[data-title="Groups"] [data-test-name="addRelationsLink"]')

    await browser.waitForVisible('h2=Add User to Groups', 5000)
    await browser.click('.list-group-item=Jocks')
    await browser.click('.list-group-item=Posers')
    await browser.click('[data-test-name="saveRelationsButton"]')
    await drilldownTransitionsDone()
    await browser.waitForVisible('h2=jimbob Profile', 5000)
    expect(await browser.isVisible('[data-related-item-name="Jocks"]')).to.be.true
    expect(await browser.isVisible('[data-related-item-name="Posers"]')).to.be.true
    await browser.click('[data-title="Groups"] [data-test-name="toggleCanRemoveButton"]')
    await browser.click('[data-related-item-name="Jocks"] [data-test-name="removeRelationButton"]')
    await browser.waitForVisible('[data-related-item-name="Jocks"]', 5000, true)
  })
})

