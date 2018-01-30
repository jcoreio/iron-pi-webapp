// @flow

/* global browser */

import {describe, it, beforeEach} from 'mocha'
import {expect} from 'chai'
import navigateTo from '../util/navigateTo'
import loginIfNecessary from '../util/loginIfNecessary'
import graphql from '../util/graphql'
import poll from '@jcoreio/poll/lib/index'

module.exports = () => {
  describe('DigitalInput mode', function () {
    this.timeout(60000)
    beforeEach(async () => {
      await graphql({
        query: `mutation prepareTest($channel: InputChannel!, $channelId: Int!, $rawInput: Int!) {
          updateChannel(channel: $channel) {
            id
          }
          setChannelValue(channelId: $channelId, rawDigitalInput: $rawInput)
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
          },
          channelId: 1,
          rawInput: 0,
        }
      })
      await navigateTo('/channel/1')
      await loginIfNecessary()
      browser.timeouts('implicit', 5000)
    })

    it('displays correct title in the navbar', async () => {
      expect(await browser.getText('#navbar [data-component="Title"]')).to.match(/^\s*Local I\/O\s+Channel 1\s*$/)
    })

    it('displays the correct initial values', async () => {
      expect(await browser.getAttribute('#channelForm [name="config.mode"]', 'data-value')).to.equal('DIGITAL_INPUT')
      expect(await browser.getAttribute('#channelForm [name="config.reversePolarity"]', 'data-value')).to.equal('true')
      expect(await browser.getValue('#channelForm [name="name"]')).to.equal('Channel 1')
      expect(await browser.getValue('#channelForm [name="channelId"]')).to.equal('channel1')

      expect(await browser.getText('[data-component="DigitalInputStateWidget"] [data-component="ValueBlock"][data-test-name="rawInput"] [data-test-name="value"]')).to.equal('0')
      expect(await browser.getText('[data-component="DigitalInputStateWidget"] [data-component="ValueBlock"][data-test-name="systemValue"] [data-test-name="value"]')).to.equal('1')
    })

    it('displays updated values', async () => {
      await graphql({
        query: `mutation update($channelId: Int!, $rawInput: Int!) {
          setChannelValue(channelId: $channelId, rawDigitalInput: $rawInput)
        }`,
        operationName: 'update',
        variables: {
          channelId: 1,
          rawInput: 1,
        }
      })

      browser.timeouts('implicit', 100)
      await poll(
        async () => {
          expect(await browser.getText('[data-component="DigitalInputStateWidget"] [data-component="ValueBlock"][data-test-name="rawInput"] [data-test-name="value"]')).to.equal('1')
          expect(await browser.getText('[data-component="DigitalInputStateWidget"] [data-component="ValueBlock"][data-test-name="systemValue"] [data-test-name="value"]')).to.equal('0')
        },
        200
      )
    })

    it('displays required validation errors', async () => {
      const fields = ['name', 'channelId']
      for (let field of fields) {
        await browser.setValue(`#channelForm [name="${field}"]`, '')
      }
      await browser.click('#channelForm [type="submit"]')

      for (let field of fields) {
        expect(await browser.getText(`#channelForm [data-name="${field}"] [data-component="FormHelperText"]`)).to.equal(
          'is required'
        )
      }

      expect(await browser.isVisible(`#channelForm [data-name="config.units"] [data-component="FormHelperText"]`)).to.be.false
    })

    it('displays other validation errors', async () => {
      const values = {
        channelId: '1channel',
      }
      const errors = {
        channelId: 'invalid Channel ID',
      }
      for (let name in values) {
        await browser.setValue(`#channelForm [name="${name}"]`, values[name])
      }
      await browser.click('#channelForm [type="submit"]')

      for (let name in errors) {
        expect(await browser.getText(`#channelForm [data-name="${name}"] [data-component="FormHelperText"]`)).to.equal(
          errors[name]
        )
      }
    })

    it('saves normalized values', async () => {
      const values = {
        name: '  Pump Pressure  ',
        channelId: '  pump/pressure  ',
      }

      for (let name in values) {
        await browser.setValue(`#channelForm [name="${name}"]`, values[name])
      }
      await browser.click('#channelForm [name="config.reversePolarity"] [value="false"]')
      await browser.click('#channelForm [type="submit"]')
      browser.timeouts('implicit', 100)
      await browser.waitForVisible('div=Your changes have been saved!', 5000)

      const {data: {Channel}} = await graphql({
        query: `query {
          Channel(id: 1) {
            name
            channelId
            config
          }
        }`
      })
      expect(Channel).to.containSubset({
        name: values.name.trim(),
        channelId: values.channelId.trim(),
        config: {
          mode: 'DIGITAL_INPUT',
          reversePolarity: false,
        },
      })
    })
  })
}
