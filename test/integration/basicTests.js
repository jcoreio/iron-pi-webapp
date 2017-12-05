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
  it('serves 500 for errorTest', () => expect(superagent.get(rootUrl() + '/errorTest')).to.be.rejectedWith(Error))
})


