// @flow

/* global browser */

import {describe, it, beforeEach} from 'mocha'
import {expect} from 'chai'
import navigateTo from '../util/navigateTo'
import loginIfNecessary from '../util/loginIfNecessary'
import graphql from '../util/graphql'

module.exports = () => {
  describe('AnalogInput mode', function () {
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
              mode: 'ANALOG_INPUT',
              units: 'gal',
              precision: 2,
              min: 0.5,
              max: 2.5,
            },
          }
        }
      })
      await navigateTo('/channel/1')
      await loginIfNecessary()
      browser.timeouts('implicit', 5000)
    })

    it('displays the correct initial values', async () => {
      expect(await browser.getAttribute('#channelForm [name="config.mode"]', 'data-value')).to.equal('ANALOG_INPUT')
      expect(await browser.getValue('#channelForm [name="name"]')).to.equal('Channel 1')
      expect(await browser.getValue('#channelForm [name="channelId"]')).to.equal('channel1')
      expect(await browser.getValue('#channelForm [name="config.units"]')).to.equal('gal')
      expect(await browser.getValue('#channelForm [name="config.precision"]')).to.equal('2')
      expect(await browser.getValue('#channelForm [name="config.min"]')).to.equal('0.5')
      expect(await browser.getValue('#channelForm [name="config.max"]')).to.equal('2.5')
    })
  })
}
