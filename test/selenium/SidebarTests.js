/* global browser */

import {describe, it, beforeEach} from 'mocha'
import {expect} from 'chai'
import delay from 'delay'

import navigateTo from "./util/navigateTo"
import graphql from './util/graphql'
import theme from '../../src/universal/theme'
import loginIfNecessary from './util/loginIfNecessary'
import logoutIfNecessary from './util/logoutIfNecessary'

const WIDE = theme.sidebar.autoOpenBreakpoint()

module.exports = () => describe('Sidebar', function () {
  this.timeout(60000)

  describe('when logged in', function () {
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
      await loginIfNecessary()
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
      await loginIfNecessary()
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
      await loginIfNecessary()
      expect(await browser.getLocation('body #body', 'x')).to.equal(theme.sidebar.width)

      await browser.click('body #closeSidebarButton')
      await delay(300)
      expect(await browser.getLocation('body #body', 'x')).to.equal(0)

      await browser.click('body #toggleSidebarButton')
      await delay(300)
      expect(await browser.getLocation('body #body', 'x')).to.equal(theme.sidebar.width)
    })

    it("pushes over content when viewport is narrow", async function () {
      await browser.setViewportSize({
        width: WIDE - 1,
        height: 800,
      })
      await navigateTo('/')
      await loginIfNecessary()
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
        await loginIfNecessary()
      })

      it('contains proper headers', async function () {
        expect(await browser.getText('#sidebar h1')).to.equal('jcore.io')
        expect(await browser.getText('#sidebar h2')).to.equal('IRON PI')
      })

      it("shows a status item", async function () {
        expect(await browser.isVisible('#sidebar li[data-test-title="Status"]')).to.be.true
      })

      it("shows a Local I/O item", async function () {
        browser.timeouts('implicit', 500)
        await browser.waitForVisible('#sidebar li[data-test-title="Local I/O"]', 10000)
      })

      it('Local I/O item is collapsible', async function () {
        browser.timeouts('implicit', 500)
        await browser.waitForVisible('#sidebar li[data-test-title="Local I/O"]', 10000)
        await browser.waitForVisible('#sidebar [data-component="List"][data-test-title="Local I/O"]', 10000)

        await browser.click('#sidebar li[data-test-title="Local I/O"]')
        await delay(300)
        expect(await browser.isVisible('#sidebar [data-component="List"][data-test-title="Local I/O"]')).to.be.false

        await browser.click('#sidebar li[data-test-title="Local I/O"]')
        await delay(300)
        expect(await browser.isVisible('#sidebar [data-component="List"][data-test-title="Local I/O"]')).to.be.true
      })

      it("shows Local I/O Channels", async function () {
        const query = `{
          Channels {
            id
            name
          }      
        }`
        const {data: {Channels}} = await graphql({query, variables: null, operationName: null})

        browser.timeouts('implicit', 500)
        await browser.waitForVisible('#sidebar [data-component="List"][data-test-title="Local I/O"]', 10000)

        browser.timeouts('implicit', 5000)
        const displayedChannelIds = await browser.getText('#sidebar [data-component="List"][data-test-title="Local I/O"] [data-component="ChannelStateItem"] [data-test-name="id"]')
        const displayedChannelNames = await browser.getText('#sidebar [data-component="List"][data-test-title="Local I/O"] [data-component="ChannelStateItem"] [data-test-name="name"]')

        expect(displayedChannelIds).to.deep.equal(Channels.map(({id}) => String(id)))
        expect(displayedChannelNames).to.deep.equal(Channels.map(({name}) => name))
      })
    })
  })

  describe('when logged out', function () {
    beforeEach(async () => {
      await browser.setViewportSize({
        width: WIDE,
        height: 800,
      })
      await navigateTo('/')
      await logoutIfNecessary()
      browser.timeouts('implicit', 5000)
      expect(await browser.isVisible('body #openUserMenuButton')).to.be.false
    })

    it("doesn't show a Local I/O item or channels", async function () {
      browser.timeouts('implicit', 500)
      expect(await browser.isVisible('#sidebar li[data-test-title="Local I/O"]')).to.be.false
      expect(await browser.isVisible('#sidebar [data-component="List"][data-test-title="Local I/O"]')).to.be.false
    })
  })
})

