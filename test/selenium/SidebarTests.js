/* global browser */

import {describe, it, beforeEach} from 'mocha'
import {expect} from 'chai'
import navigateTo from "./util/navigateTo"
import delay from 'delay'
import theme from '../../src/universal/theme'

const WIDE = theme.sidebar.autoOpenBreakpoint()

module.exports = () => describe('Sidebar', function () {
  this.timeout(30000)

  beforeEach(async () => {
    browser.timeouts('implicit', 5000)
  })

  const sidebarIsVisible = () => browser.isVisibleWithinViewport('body #sidebar')

  it('shows when viewport is wide enough before being toggled', async function () {
    await browser.setViewportSize({
      width: WIDE,
      height: 800,
    })
    await navigateTo('/')
    expect(await sidebarIsVisible()).to.be.true

    await browser.setViewportSize({
      width: WIDE - 1,
      height: 800,
    })
    await delay(300)
    expect(await sidebarIsVisible()).to.be.false

    await browser.setViewportSize({
      width: WIDE,
      height: 800,
    })
    await delay(300)
    expect(await sidebarIsVisible()).to.be.true
  })

  it('shows regardless of viewport size after being toggled', async function () {
    await browser.setViewportSize({
      width: WIDE - 1,
      height: 800,
    })
    await navigateTo('/')
    expect(await sidebarIsVisible()).to.be.false

    await browser.click('body #toggleSidebarButton')
    await delay(300)
    expect(await sidebarIsVisible()).to.be.true

    await browser.click('body #closeSidebarButton')
    await delay(300)
    expect(await sidebarIsVisible()).to.be.false
  })

  it('pushes over the content when viewport is wide', async function () {
    await browser.setViewportSize({
      width: WIDE,
      height: 800,
    })
    await navigateTo('/')
    expect(await browser.getLocation('body #body', 'x')).to.equal(theme.sidebar.width)

    await browser.click('body #closeSidebarButton')
    await delay(300)
    expect(await browser.getLocation('body #body', 'x')).to.equal(0)

    await browser.click('body #toggleSidebarButton')
    await delay(300)
    expect(await browser.getLocation('body #body', 'x')).to.equal(theme.sidebar.width)
  })

  it("overlaps content when viewport is narrow", async function () {
    await browser.setViewportSize({
      width: WIDE - 1,
      height: 800,
    })
    await navigateTo('/')
    expect(await browser.getLocation('body #body', 'x')).to.equal(0)

    await browser.click('body #toggleSidebarButton')
    await delay(300)
    expect(await browser.getLocation('body #body', 'x')).to.equal(theme.sidebar.width)

    await browser.click('body #closeSidebarButton')
    await delay(300)
    expect(await browser.getLocation('body #body', 'x')).to.equal(0)
  })

  describe("content", function () {
    before(async () => {
      await browser.setViewportSize({
        width: WIDE,
        height: 800,
      })
      await navigateTo('/')
    })

    it('contains proper headers', async function () {
      expect(await browser.getText('#sidebar h1')).to.equal('jcore.io')
      expect(await browser.getText('#sidebar h2')).to.equal('IRON PI')
    })

    // it("shows a status item", async function () {
    //   expect(await browser.isVisible('#sidebar li=STATUS')).to.be.true
    // })
    //
    // it("shows a Local I/O item", async function () {
    //   expect(await browser.isVisible('#sidebar li=LOCAL I/O')).to.be.true
    // })
  })
})
