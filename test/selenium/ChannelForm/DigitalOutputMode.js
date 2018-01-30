// @flow

/* global browser */

import {describe, it} from 'mocha'
import {expect} from 'chai'
import navigateTo from '../util/navigateTo'
import loginIfNecessary from '../util/loginIfNecessary'
import graphql from '../util/graphql'
import poll from '@jcoreio/poll'
import type {Channel} from '../../../src/universal/types/Channel'

module.exports = () => {
  describe('DigitalOutput mode', function () {
    this.timeout(60000)

    const defaultChannel = {
      id: 1,
      name: 'Channel 1',
      channelId: 'channel1',
      config: {
        mode: 'DIGITAL_OUTPUT',
        safeState: 0,
        reversePolarity: false,
        controlMode: 'REMOTE_CONTROL',
      },
    }

    async function init(channel: Channel = defaultChannel, controlValue: 0 | 1 | null = null): Promise<void> {
      await graphql({
        query: `mutation prepareTest($channel: InputChannel!) {
          updateChannel(channel: $channel) {
            id
          }
        }
        `,
        operationName: 'prepareTest',
        variables: {
          channel: defaultChannel,
        }
      })
      await graphql({
        query: `mutation prepareTest($channelId: Int!, $controlValue: Int) {
          setChannelValue(channelId: $channelId, controlValue: $controlValue)
        }
        `,
        operationName: 'prepareTest',
        variables: {
          channelId: channel.id,
          controlValue,
        }
      })
      await navigateTo(`/channel/${channel.id}`)
      await loginIfNecessary()
      browser.timeouts('implicit', 5000)
    }

    it('displays correct title in the navbar', async () => {
      await init()
      expect(await browser.getText('#navbar [data-component="Title"]')).to.match(/^\s*Local I\/O\s*Channel 1\s*$/)
    })

    it('displays the correct initial values', async () => {
      await init()
      expect(await browser.getAttribute('#channelForm [name="config.mode"]', 'data-value')).to.equal('DIGITAL_OUTPUT')
      expect(await browser.getAttribute('#channelForm [name="config.safeState"]', 'data-value')).to.equal('0')
      expect(await browser.getAttribute('#channelForm [name="config.reversePolarity"]', 'data-value')).to.equal('false')
      expect(await browser.getAttribute('#channelForm [name="config.controlMode"]', 'data-value')).to.equal('REMOTE_CONTROL')
      expect(await browser.getValue('#channelForm [name="name"]')).to.equal('Channel 1')
      expect(await browser.getValue('#channelForm [name="channelId"]')).to.equal('channel1')
    })

    it('displays the correct initial values for local control', async () => {
      await graphql({
        query: `mutation prepareTest($channel: InputChannel!) {
          updateChannel(channel: $channel) {
            id
          }
        }
        `,
        operationName: 'prepareTest',
        variables: {
          channel: {
            id: 1,
            name: 'Channel 1',
            channelId: 'channel1',
            config: {
              mode: 'DIGITAL_OUTPUT',
              safeState: 0,
              reversePolarity: false,
              controlMode: 'LOCAL_CONTROL',
              controlLogic: [
                {channelId: 2, comparison: 'GTE', threshold: 2.3},
                {operation: 'OR', channelId: 3, comparison: 'EQ', threshold: 1.5},
              ]
            },
          },
        }
      })
      await navigateTo('/channel/1')
      await loginIfNecessary()

      expect(await browser.getAttribute('#channelForm [name="config.mode"]', 'data-value')).to.equal('DIGITAL_OUTPUT')
      expect(await browser.getAttribute('#channelForm [name="config.safeState"]', 'data-value')).to.equal('0')
      expect(await browser.getAttribute('#channelForm [name="config.reversePolarity"]', 'data-value')).to.equal('false')
      expect(await browser.getAttribute('#channelForm [name="config.controlMode"]', 'data-value')).to.equal('LOCAL_CONTROL')
      expect(await browser.getValue('#channelForm [name="name"]')).to.equal('Channel 1')
      expect(await browser.getValue('#channelForm [name="channelId"]')).to.equal('channel1')
      expect(await browser.getValue('#channelForm [name="config.controlLogic[0].channelId"]')).to.equal('2')
      expect(await browser.getValue('#channelForm [name="config.controlLogic[0].comparison"]')).to.equal('GTE')
      expect(await browser.getValue('#channelForm [name="config.controlLogic[0].threshold"]')).to.equal('2.3')
      expect(await browser.getValue('#channelForm [name="config.controlLogic[1].operation"]')).to.equal('OR')
      expect(await browser.getValue('#channelForm [name="config.controlLogic[1].channelId"]')).to.equal('3')
      expect(await browser.getValue('#channelForm [name="config.controlLogic[1].comparison"]')).to.equal('EQ')
      expect(await browser.getValue('#channelForm [name="config.controlLogic[1].threshold"]')).to.equal('1.5')
    })

    it('displays updated values', async () => {
      await init()

      await graphql({
        query: `mutation update($channel: InputChannel!, $channelId: Int!, $controlValue: Int) {
          updateChannel(channel: $channel) {
            id
          }
          setChannelValue(channelId: $channelId, controlValue: $controlValue)
        }`,
        operationName: 'update',
        variables: {
          channel: {
            id: 1,
            config: {
              mode: 'DIGITAL_OUTPUT',
              safeState: 0,
              reversePolarity: false,
              controlMode: 'REMOTE_CONTROL',
            },
          },
          channelId: 1,
          controlValue: 1,
        }
      })

      browser.timeouts('implicit', 100)
      await poll(
        async () => {
          expect(await browser.getText('[data-component="DigitalOutputStateWidget"] [data-component="ValueBlock"][data-test-name="controlValue"] [data-test-name="value"]')).to.equal('1')
          expect(await browser.getText('[data-component="DigitalOutputStateWidget"] [data-component="ValueBlock"][data-test-name="rawOutput"] [data-test-name="value"]')).to.equal('1')
        },
        200
      )
    })

    it('sets force on correctly', async () => {
      await init()

      await browser.click('#channelForm [name="config.controlMode"] [value="FORCE_ON"]')
      browser.timeouts('implicit', 100)
      // animation can cause click location errors, so poll
      await poll(() => browser.click('#channelForm [type="submit"]'), 50).timeout(1000)

      await browser.waitForVisible('[data-status="submitSucceeded"]', 5000)
      await poll(
        async () => {
          expect(await browser.getText('[data-component="DigitalOutputStateWidget"] [data-component="ValueBlock"][data-test-name="controlValue"] [data-test-name="value"]')).to.equal('1')
          expect(await browser.getText('[data-component="DigitalOutputStateWidget"] [data-component="ValueBlock"][data-test-name="rawOutput"] [data-test-name="value"]')).to.equal('1')
        },
        50
      )
    })

    it('sets force off correctly', async () => {
      await init()

      await browser.click('#channelForm [name="config.controlMode"] [value="FORCE_OFF"]')
      browser.timeouts('implicit', 100)
      // animation can cause click location errors, so poll
      await poll(() => browser.click('#channelForm [type="submit"]'), 50).timeout(1000)

      await browser.waitForVisible('[data-status="submitSucceeded"]', 5000)
      await poll(
        async () => {
          expect(await browser.getText('[data-component="DigitalOutputStateWidget"] [data-component="ValueBlock"][data-test-name="controlValue"] [data-test-name="value"]')).to.equal('0')
          expect(await browser.getText('[data-component="DigitalOutputStateWidget"] [data-component="ValueBlock"][data-test-name="rawOutput"] [data-test-name="value"]')).to.equal('0')
        },
        50
      )
    })

    it('applies safe state when control value is missing', async () => {
      await init()

      await browser.click('#channelForm [name="config.safeState"] [value="1"]')
      browser.timeouts('implicit', 100)
      // animation can cause click location errors, so poll
      await poll(() => browser.click('#channelForm [type="submit"]'), 50).timeout(1000)

      await browser.waitForVisible('[data-status="submitSucceeded"]', 5000)

      await poll(
        async () => {
          expect(await browser.getText('[data-component="DigitalOutputStateWidget"] [data-component="ValueBlock"][data-test-name="controlValue"] [data-test-name="value"]')).to.equal('')
          expect(await browser.getText('[data-component="DigitalOutputStateWidget"] [data-component="ValueBlock"][data-test-name="safeState"] [data-test-name="value"]')).to.equal('1')
          expect(await browser.getText('[data-component="DigitalOutputStateWidget"] [data-component="ValueBlock"][data-test-name="rawOutput"] [data-test-name="value"]')).to.equal('1')
        },
        50
      )
    })

    it("doesn't apply safe state when control value is present", async () => {
      await init(defaultChannel, 0)

      await browser.click('#channelForm [name="config.safeState"] [value="1"]')
      browser.timeouts('implicit', 100)
      // animation can cause click location errors, so poll
      await poll(() => browser.click('#channelForm [type="submit"]'), 50).timeout(1000)

      await browser.waitForVisible('[data-status="submitSucceeded"]', 5000)

      await poll(
        async () => {
          expect(await browser.getText('[data-component="DigitalOutputStateWidget"] [data-component="ValueBlock"][data-test-name="controlValue"] [data-test-name="value"]')).to.equal('0')
          expect(await browser.getText('[data-component="DigitalOutputStateWidget"] [data-component="ValueBlock"][data-test-name="safeState"] [data-test-name="value"]')).to.equal('1')
          expect(await browser.getText('[data-component="DigitalOutputStateWidget"] [data-component="ValueBlock"][data-test-name="rawOutput"] [data-test-name="value"]')).to.equal('0')
        },
        50
      )
    })
  })
}
