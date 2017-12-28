/* global browser */

import {expect} from 'chai'
import superagent from './util/superagent'
import navigateTo from "./util/navigateTo"
import delay from 'delay'

module.exports = () => describe('basic tests', () => {
  it('serves page with correct title', async function () {
    await navigateTo('/')
    expect(await browser.getTitle()).to.equal('Iron Pi')
  })
  it('serves 404 for favicon', async () => {
    let error
    try {
      await superagent.get('/favicon.png')
    } catch (err) {
      error = err
    }
    expect(error).to.exist
    expect(error.status).to.equal(404)
  })
  it('serves 404 for invalid route', async () => {
    let error
    try {
      await superagent.get('/blah')
    } catch (err) {
      error = err
    }
    expect(error).to.exist
    expect(error.status).to.equal(404)
  })
  it('handles links', async () => {
    browser.timeouts('implicit', 1000)
    await navigateTo('/about')
    expect(await browser.getText('#body h1')).to.equal('About')
    await browser.click('=Home')
    await delay(300)
    expect(await browser.getText('#body h1')).to.equal('Home')
  })
})
