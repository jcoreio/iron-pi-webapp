// @flow

/* global browser */

import {describe, it, beforeEach} from 'mocha'
import {expect} from 'chai'
import navigateTo from '../util/navigateTo'
import loginIfNecessary from '../util/loginIfNecessary'
import graphql from '../util/graphql'

module.exports = () => {
  describe('DigitalInput mode', function () {
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
              mode: 'DIGITAL_INPUT',
              reversePolarity: true,
            },
          }
        }
      })
      await navigateTo('/channel/1')
      await loginIfNecessary()
      browser.timeouts('implicit', 5000)
    })

    it('displays the correct initial values', async () => {
      expect(await browser.getAttribute('#channelForm [name="config.mode"]', 'data-value')).to.equal('DIGITAL_INPUT')
      expect(await browser.getAttribute('#channelForm [name="config.reversePolarity"]', 'data-value')).to.equal('true')
      expect(await browser.getValue('#channelForm [name="name"]')).to.equal('Channel 1')
      expect(await browser.getValue('#channelForm [name="channelId"]')).to.equal('channel1')
    })
  })
}
