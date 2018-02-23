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
  metadataItem: {
    tag: 'channel1',
    name: 'Channel 1',
    dataType: 'number',
    units: 'gal',
    min: 0.5,
    max: 2.5,
    displayPrecision: 1,
    storagePrecision: 1,
  },
  config: {
    mode: 'ANALOG_INPUT',
    calibration: {
      points: [
        {x: 0, y: 0},
        {x: 1, y: 10},
      ]
    }
  },
}

module.exports = () => {
  describe('AnalogInput mode', function () {
    this.timeout(60000)
    beforeEach(async () => {
      const {id} = defaultChannel
      await graphql({
        query: `mutation prepareTest($channel: InputLocalIOChannel!, $id: Int!, $rawInput: Float!) {
          updateLocalIOChannel(id: $id, channel: $channel) {
            id
          }
          setLocalChannelRawInput(id: $id, rawAnalogInput: $rawInput)
        }
        `,
        operationName: 'prepareTest',
        variables: {
          id,
          channel: defaultChannel,
          rawInput: 2.356,
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
      expect(await browser.getAttribute('#channelForm [name="config.mode"]', 'data-value')).to.equal('ANALOG_INPUT')
      expect(await browser.getValue('#channelForm [name="metadataItem.name"]')).to.equal('Channel 1')
      expect(await browser.getValue('#channelForm [name="metadataItem.tag"]')).to.equal('channel1')
      expect(await browser.getValue('#channelForm [name="metadataItem.units"]')).to.equal('gal')
      expect(await browser.getValue('#channelForm [name="metadataItem.displayPrecision"]')).to.equal('1')
      expect(await browser.getValue('#channelForm [name="metadataItem.min"]')).to.equal('0.5')
      expect(await browser.getValue('#channelForm [name="metadataItem.max"]')).to.equal('2.5')

      expect(await browser.getText('[data-component="AnalogInputStateWidget"] [data-component="ValueBlock"][data-test-name="rawInput"] [data-test-name="value"]')).to.equal('2.36')
      expect(await browser.getText('[data-component="AnalogInputStateWidget"] [data-component="ValueBlock"][data-test-name="systemValue"] [data-test-name="value"]')).to.equal('23.6')
    })

    it('displays updated values', async () => {
      const {id} = defaultChannel
      await graphql({
        query: `mutation update($id: Int!, $rawInput: Float!) {
          setLocalChannelRawInput(id: $id, rawAnalogInput: $rawInput)
        }`,
        operationName: 'update',
        variables: {
          id,
          rawInput: 3.58,
        }
      })

      browser.timeouts('implicit', 100)
      await poll(
        async () => {
          expect(await browser.getText('[data-component="AnalogInputStateWidget"] [data-component="ValueBlock"][data-test-name="rawInput"] [data-test-name="value"]')).to.equal('3.58')
          expect(await browser.getText('[data-component="AnalogInputStateWidget"] [data-component="ValueBlock"][data-test-name="systemValue"] [data-test-name="value"]')).to.equal('35.8')
        },
        200
      )
    })

    it('displays required validation errors', async () => {
      const fields = ['metadataItem.name', 'metadataItem.tag', 'metadataItem.units', 'metadataItem.displayPrecision', 'metadataItem.min', 'metadataItem.max']
      for (let field of fields) {
        await browser.setValue(`#channelForm [name="${field}"]`, '')
      }
      await browser.click('#channelForm [type="submit"]')

      for (let field of fields) {
        if (field === 'metadataItem.units') continue
        expect(await browser.getText(`#channelForm [data-name="${field}"] [data-component="FormHelperText"]`)).to.equal(
          'is required'
        )
      }

      expect(await browser.isVisible(`#channelForm [data-name="metadataItem.units"] [data-component="FormHelperText"]`)).to.be.false
    })

    it('displays other validation errors', async () => {
      const values = {
        'metadataItem.displayPrecision': '2.5',
        'metadataItem.min': '5',
        'metadataItem.max': '0',
      }
      const errors = {
        'metadataItem.displayPrecision': 'is not an integer',
        'metadataItem.min': 'must be < max',
        'metadataItem.max': 'must be > min',
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
      const {id} = defaultChannel
      const values = {
        'metadataItem.tag': 'pumpPress',
        'metadataItem.name': '  Pump Pressure  ',
        'metadataItem.displayPrecision': ' 1   ',
        'metadataItem.units': 'psi',
        'metadataItem.min': ' 0.3 ',
        'metadataItem.max': ' 10.5 ',
      }

      for (let name in values) {
        await browser.setValue(`#channelForm [name="${name}"]`, values[name])
      }
      await browser.click('#channelForm [type="submit"]')
      browser.timeouts('implicit', 100)
      await browser.waitForVisible('div=Your changes have been saved!', 5000)

      const {data: {Channel}} = await graphql({
        query: `query blah($id: Int!) {
          Channel: LocalIOChannel(id: $id) {
            metadataItem {
              tag
              name
              ... on NumericMetadataItem {
                units
                displayPrecision
                min
                max
              }
            } 
            config
          }
        }`,
        variables: {id},
      })
      expect(Channel).to.containSubset({
        metadataItem: {
          name: values['metadataItem.name'].trim(),
          tag: values['metadataItem.tag'].trim(),
          units: 'psi',
          displayPrecision: parseInt(values['metadataItem.displayPrecision']),
          min: parseFloat(values['metadataItem.min']),
          max: parseFloat(values['metadataItem.max']),
        },
        config: {
          mode: 'ANALOG_INPUT',
        },
      })
    })
    it('can be switched to DigitalInput mode', async () => {
      const {id} = defaultChannel

      await browser.click(`#channelForm [name="config.mode"] [value="DIGITAL_INPUT"]`)
      await browser.click(`#channelForm [name="config.reversePolarity"] [value="false"]`)
      await browser.click('#channelForm [type="submit"]')
      browser.timeouts('implicit', 100)
      await browser.waitForVisible('div=Your changes have been saved!', 5000)
      await browser.waitForVisible('[data-component="DigitalInputStateWidget"]', 5000)

      const {data: {Channel}} = await graphql({
        query: `query blah($id: Int!) {
          Channel: LocalIOChannel(id: $id) {
            metadataItem {
              tag
              name
              dataType
              ... on DigitalMetadataItem {
                isDigital 
              }
            }
            config
          }
        }`,
        variables: {id},
      })

      expect(Channel.config.mode).to.equal('DIGITAL_INPUT')
      expect(Channel.config.reversePolarity).to.be.false
      expect(Channel.metadataItem.tag).to.equal(defaultChannel.metadataItem.tag)
      expect(Channel.metadataItem.name).to.equal(defaultChannel.metadataItem.name)
      expect(Channel.metadataItem.dataType).to.equal('number')
      expect(Channel.metadataItem.isDigital).to.be.true
    })
  })
}
