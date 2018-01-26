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

    it('displays required validation errors', async () => {
      const fields = ['name', 'channelId', 'config.units', 'config.precision', 'config.min', 'config.max']
      for (let field of fields) {
        await browser.setValue(`#channelForm [name="${field}"]`, '')
      }
      await browser.click('#channelForm [type="submit"]')

      for (let field of fields) {
        if (field === 'config.units') continue
        expect(await browser.getText(`#channelForm [data-name="${field}"] [data-component="FormHelperText"]`)).to.equal(
          'is required'
        )
      }

      expect(await browser.isVisible(`#channelForm [data-name="config.units"] [data-component="FormHelperText"]`)).to.be.false
    })

    it('displays other validation errors', async () => {
      const values = {
        channelId: '1channel',
        'config.precision': '2.5',
        'config.min': '5',
        'config.max': '0',
      }
      const errors = {
        channelId: 'invalid Channel ID',
        'config.precision': 'is not an integer',
        'config.min': 'must be < max',
        'config.max': 'must be > min',
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
        'config.precision': ' 1   ',
        'config.units': 'psi',
        'config.min': ' 0.3 ',
        'config.max': ' 10.5 ',
      }

      for (let name in values) {
        await browser.setValue(`#channelForm [name="${name}"]`, values[name])
      }
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
      expect(Channel).to.deep.equal({
        name: values.name.trim(),
        channelId: values.channelId.trim(),
        config: {
          mode: 'ANALOG_INPUT',
          units: 'psi',
          precision: parseInt(values['config.precision']),
          min: parseFloat(values['config.min']),
          max: parseFloat(values['config.max']),
        },
      })
    })
  })
}
