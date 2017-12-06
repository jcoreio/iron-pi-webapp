/* global browser */

import chai, {expect} from 'chai'
import asPromised from 'chai-as-promised'
import superagent from 'superagent'
import navigateTo from "./util/navigateTo"
import rootUrl from "./util/rootUrl"

chai.use(asPromised)

describe('basic tests', () => {
  it('serves page with correct title', async function () {
    await navigateTo('/')
    expect(await browser.getTitle()).to.equal('Iron Pi')
  })
  it('serves 404 for favicon', () => expect(superagent.get(rootUrl() + '/favicon.png')).to.be.rejectedWith(Error))
  it('serves 404 for invalid route', () => expect(superagent.get(rootUrl() + '/blah')).to.be.rejectedWith(Error))
  it('serves 500 for errorTest', () => expect(superagent.get(rootUrl() + '/errorTest')).to.be.rejectedWith(Error))
  it('handles redirects', async () => {
    let error
    await superagent.get(rootUrl() + '/redirectTest/301').redirects(0).catch(err => error = err)
    expect(error.status).to.equal(301)
    await superagent.get(rootUrl() + '/redirectTest/302').redirects(0).catch(err => error = err)
    expect(error.status).to.equal(302)
  })
  it('handles links', async () => {
    await navigateTo('/about')
    expect(await browser.getText('h1')).to.equal('About')
    await browser.click('=Home')
    expect(await browser.getText('h1')).to.equal('Home')
  })
})


