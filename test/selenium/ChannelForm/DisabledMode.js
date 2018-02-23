// @flow

/* global browser */

import {describe, it, beforeEach} from 'mocha'
import {expect} from 'chai'
import navigateTo from '../util/navigateTo'
import loginIfNecessary from '../util/loginIfNecessary'
import graphql from '../util/graphql'
import poll from '@jcoreio/poll'

const defaultChannel = {
  id: 0,
  tag: null,
  config: {
    mode: 'DISABLED',
  },
}

module.exports = () => {
  describe('Disabled mode', function () {
    this.timeout(60000)
    beforeEach(async () => {
      const {id} = defaultChannel
      await graphql({
        query: `mutation prepareTest($channel: InputLocalIOChannel!, $id: Int!) {
          updateLocalIOChannel(id: $id, channel: $channel) {
            id
          }
        }
        `,
        operationName: 'prepareTest',
        variables: {
          id,
          channel: defaultChannel,
        }
      })
      await navigateTo(`/channel/${id + 1}`)
      await loginIfNecessary()
      browser.timeouts('implicit', 5000)
    })

    it('displays correct title in the navbar', async () => {
      expect(await browser.getText('#navbar [data-component="Title"]')).to.match(/^\s*Local I\/O\s*Channel 1\s*$/)
    })

    it('displays the correct initial values', async () => {
      expect(await browser.getAttribute('#channelForm [name="config.mode"]', 'data-value')).to.equal('DISABLED')
      expect(await browser.getValue('#channelForm [name="metadataItem.name"]')).to.equal('')
      expect(await browser.getValue('#channelForm [name="metadataItem.tag"]')).to.equal('')

      expect(await browser.isVisible('[data-component="DisabledStateWidget"]')).to.be.true
    })
  })
}
