// @flow

/* global browser */

import {describe, it, beforeEach} from 'mocha'
import {expect} from 'chai'
import navigateTo from '../util/navigateTo'
import loginIfNecessary from '../util/loginIfNecessary'
import graphql from '../util/graphql'
import poll from '@jcoreio/poll/lib/index'

const defaultChannel = {
  id: 0,
  metadataItem: {
    tag: 'channel1',
    name: 'Channel 1',
    dataType: 'number',
    isDigital: true,
  },
  config: {
    mode: 'DIGITAL_INPUT',
    reversePolarity: true,
  },
}

module.exports = () => {
  describe('DigitalInput mode', function () {
    this.timeout(60000)
    beforeEach(async () => {
      const {id} = defaultChannel
      await graphql({
        query: `mutation prepareTest($channel: InputLocalIOChannel!, $id: Int!, $rawInput: Boolean!) {
          updateLocalIOChannel(id: $id, channel: $channel) {
            id
          }
          setLocalChannelRawInput(id: $id, rawDigitalInput: $rawInput)
        }
        `,
        operationName: 'prepareTest',
        variables: {
          id,
          channel: defaultChannel,
          rawInput: false,
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
      expect(await browser.getAttribute('#channelForm [name="config.mode"]', 'data-value')).to.equal('DIGITAL_INPUT')
      expect(await browser.getAttribute('#channelForm [name="config.reversePolarity"]', 'data-value')).to.equal('true')
      expect(await browser.getValue('#channelForm [name="metadataItem.name"]')).to.equal('Channel 1')
      expect(await browser.getValue('#channelForm [name="metadataItem.tag"]')).to.equal('channel1')

      expect(await browser.getText('[data-component="DigitalInputStateWidget"] [data-component="ValueBlock"][data-test-name="rawInput"] [data-test-name="value"]')).to.equal('0')
      expect(await browser.getText('[data-component="DigitalInputStateWidget"] [data-component="ValueBlock"][data-test-name="systemValue"] [data-test-name="value"]')).to.equal('1')
    })
    it('displays updated values', async () => {
      await graphql({
        query: `mutation update($id: Int!, $rawInput: Boolean!) {
          setLocalChannelRawInput(id: $id, rawDigitalInput: $rawInput)
        }`,
        operationName: 'update',
        variables: {
          id: defaultChannel.id,
          rawInput: true,
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
      const fields = ['metadataItem.name', 'metadataItem.tag']
      for (let field of fields) {
        await browser.setValue(`#channelForm [name="${field}"]`, '')
      }
      await browser.click('#channelForm [type="submit"]')

      for (let field of fields) {
        expect(await browser.getText(`#channelForm [data-name="${field}"] [data-component="FormHelperText"]`)).to.equal(
          'is required'
        )
      }
    })

    it('saves normalized values', async () => {
      const values = {
        'metadataItem.tag': 'pumpPress',
        'metadataItem.name': '  Pump Pressure  ',
      }

      for (let name in values) {
        await browser.setValue(`#channelForm [name="${name}"]`, values[name])
      }
      await browser.click('#channelForm [name="config.reversePolarity"] [value="false"]')
      await browser.click('#channelForm [type="submit"]')
      browser.timeouts('implicit', 100)
      await browser.waitForVisible('div=Your changes have been saved!', 5000)

      const {data: {Channel}} = await graphql({
        query: `query blah($id: Int!) {
          Channel: LocalIOChannel(id: $id) {
            id
            metadataItem {
              tag
              name
            } 
            config
          }
        }`,
        variables: {id: defaultChannel.id},
      })
      expect(Channel).to.containSubset({
        metadataItem: {
          tag: values['metadataItem.tag'].trim(),
          name: values['metadataItem.name'].trim(),
        },
        config: {
          mode: 'DIGITAL_INPUT',
          reversePolarity: false,
        },
      })
    })
    it('can be switched to AnalogInput mode', async () => {
      const {id} = defaultChannel

      const values = {
        'metadataItem.units': 'kPa',
        'metadataItem.min': 5,
        'metadataItem.max': 25,
        'metadataItem.storagePrecision': 3,
        'metadataItem.displayPrecision': 2,
      }

      await browser.click(`#channelForm [name="config.mode"] [value="ANALOG_INPUT"]`)
      for (let name in values) {
        await browser.setValue(`#channelForm [name="${name}"]`, values[name])
      }
      await browser.click('#channelForm [type="submit"]')
      browser.timeouts('implicit', 100)
      await browser.waitForVisible('div=Your changes have been saved!', 5000)
      await browser.waitForVisible('[data-component="AnalogInputStateWidget"]', 5000)

      const {data: {Channel: {config, metadataItem}}} = await graphql({
        query: `query blah($id: Int!) {
          Channel: LocalIOChannel(id: $id) {
            metadataItem {
              tag
              name
              dataType
              units
              min
              max
              storagePrecision
              displayPrecision
              isDigital 
            }
            config
          }
        }`,
        variables: {id},
      })

      expect(config.mode).to.equal('ANALOG_INPUT')
      expect(metadataItem.tag).to.equal(defaultChannel.metadataItem.tag)
      expect(metadataItem.name).to.equal(defaultChannel.metadataItem.name)
      expect(metadataItem.dataType).to.equal('number')
      expect(metadataItem.isDigital).to.not.exist
      expect(metadataItem.units).to.equal(values['metadataItem.units'])
      expect(metadataItem.min).to.equal(values['metadataItem.min'])
      expect(metadataItem.max).to.equal(values['metadataItem.max'])
      expect(metadataItem.storagePrecision).to.equal(values['metadataItem.storagePrecision'])
      expect(metadataItem.displayPrecision).to.equal(values['metadataItem.displayPrecision'])
    })
  })
}
