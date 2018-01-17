// @flow

/* global browser */

import {describe, it, beforeEach} from 'mocha'
import {expect} from 'chai'
import navigateTo from '../util/navigateTo'
import loginIfNecessary from '../util/loginIfNecessary'
import graphql from '../util/graphql'

module.exports = () => {
  describe('DigitalOutput mode', function () {
    this.timeout(60000)
    beforeEach(async () => {
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
              reversePolarity: true,
              controlMode: 'LOCAL_CONTROL',
              controlLogic: [
                {channelId: 2, comparison: 'GTE', threshold: 2.3},
                {operation: 'OR', channelId: 3, comparison: 'EQ', threshold: 1.5},
              ],
            },
          }
        }
      })
      await navigateTo('/channel/1')
      await loginIfNecessary()
      browser.timeouts('implicit', 5000)
    })

    it('displays the correct initial values', async () => {
      expect(await browser.getAttribute('#channelForm [name="config.mode"]', 'data-value')).to.equal('DIGITAL_OUTPUT')
      expect(await browser.getAttribute('#channelForm [name="config.safeState"]', 'data-value')).to.equal('0')
      expect(await browser.getAttribute('#channelForm [name="config.reversePolarity"]', 'data-value')).to.equal('true')
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
  })
}
