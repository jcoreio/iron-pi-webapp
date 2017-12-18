/* global browser */

import {expect} from 'chai'
import superagent from './util/superagent'
import navigateTo from "./util/navigateTo"

module.exports = () => describe('basic tests', () => {
  it('serves page with correct title', async function () {
    await navigateTo('/')
    expect(await browser.getTitle()).to.equal('<<APP_TITLE>>')
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
    await navigateTo('/about')
    expect(await browser.getText('h1')).to.equal('About')
    await browser.click('=Home')
    expect(await browser.getText('h1')).to.equal('Home')
  })
})
