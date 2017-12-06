/* global browser */

import chai, {expect} from 'chai'
import asPromised from 'chai-as-promised'
import superagent from './util/superagent'
import navigateTo from "./util/navigateTo"

chai.use(asPromised)

describe('basic tests', () => {
  it('serves page with correct title', async function () {
    await navigateTo('/')
    expect(await browser.getTitle()).to.equal('Iron Pi')
  })
  it('serves 404 for favicon', () => expect(superagent.get('/favicon.png')).to.be.rejectedWith(Error))
  it('serves 404 for invalid route', () => expect(superagent.get('/blah')).to.be.rejectedWith(Error))
  it('handles links', async () => {
    await navigateTo('/about')
    expect(await browser.getText('h1')).to.equal('About')
    await browser.click('=Home')
    expect(await browser.getText('h1')).to.equal('Home')
  })
})


