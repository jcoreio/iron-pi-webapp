// @flow

/* global browser */

import {describe, it} from 'mocha'
import {expect} from 'chai'
import delay from 'delay'
import navigateTo from '../util/navigateTo'
import loginIfNecessary from '../util/loginIfNecessary'
import graphql from '../util/graphql'
import type {LocalIOChannel} from '../../../src/universal/localio/LocalIOChannel'

module.exports = () => {
  describe('CalibrationForm', function () {
    this.timeout(60000)

    const defaultChannel = {
      id: 0,
      tag: 'channel1',
      metadataItem: {
        tag: 'channel1',
        name: 'Channel 1',
        dataType: 'number',
        units: 'gal',
        storagePrecision: 1,
        displayPrecision: 1,
        min: 0.5,
        max: 2.5,
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

    async function init(channel?: LocalIOChannel = defaultChannel, rawInput?: number | null = null): Promise<void> {
      const {id} = channel
      await graphql({
        query: `mutation prepareTest($id: Int!, $channel: InputLocalIOChannel!, $rawInput: Float) {
          updateLocalIOChannel(id: $id, channel: $channel) {
            id
          }
          setLocalChannelRawInput(id: $id, rawAnalogInput: $rawInput)
        }
        `,
        operationName: 'prepareTest',
        variables: {
          id,
          channel,
          rawInput,
        }
      })
      await navigateTo(`/channel/${id + 1}/calibration`)
      await loginIfNecessary()
      browser.timeouts('implicit', 7000)
    }

    it('displays correct title in the navbar', async () => {
      await init()
      expect(await browser.getText('#navbar [data-component="Title"]')).to.match(/^\s*Local I\/O\s*Channel 1\s*Calibration$/)
    })

    it('clicking channel number in navbar navigates back to channel form', async () => {
      await init()
      await browser.click('#navbar [data-component="Title"] [data-test-name="channelFormLink"]')
      expect(await browser.getUrl()).to.match(/\/channel\/1$/)
    })

    describe('NumPointsStep', () => {
      it('displays the correct initial values', async () => {
        await init(undefined, 0.7)
        expect(await browser.getText('[data-test-name="calibrationFormTitle"]')).to.equal('Begin Calibration')
        expect(await browser.getValue('#calibrationForm [name="numPoints"]')).to.equal('2')
        expect(await browser.isVisible('#calibrationForm [data-test-name="calibrationTableButton"]')).to.be.true
        expect(await browser.isEnabled('#calibrationForm [data-test-name="backButton"]')).to.be.false
        expect(await browser.isEnabled('#calibrationForm [data-test-name="nextButton"]')).to.be.true
      })
      it('Calibration Table button goes straight to Calibration Table', async () => {
        const {id} = defaultChannel
        await init()
        await browser.click('#calibrationForm [data-test-name="calibrationTableButton"]')
        await delay(700)
        expect(await browser.getText('[data-test-name="calibrationFormTitle"]')).to.equal(`Channel ${id + 1} Calibration`)
      })
      it('validates fields correctly', async () => {
        await init()
        await browser.setValue('#calibrationForm [name="numPoints"]', ' ')
        await browser.click('#calibrationForm [data-test-name="nextButton"]')
        expect(await browser.getText('#calibrationForm [data-name="numPoints"] [data-component="FormHelperText"]')).to.equal(
          'is required'
        )
        await browser.setValue('#calibrationForm [name="numPoints"]', ' 2a')
        expect(await browser.getText('#calibrationForm [data-name="numPoints"] [data-component="FormHelperText"]')).to.equal(
          'must be a number'
        )
        await browser.setValue('#calibrationForm [name="numPoints"]', ' 1')
        expect(await browser.getText('#calibrationForm [data-name="numPoints"] [data-component="FormHelperText"]')).to.equal(
          'must be greater than or equal to 2'
        )
        await browser.setValue('#calibrationForm [name="numPoints"]', '20')
        expect(await browser.getText('#calibrationForm [data-name="numPoints"] [data-component="FormHelperText"]')).to.equal(
          'must be less than or equal to 10'
        )
      })
      it('sets numPoints field', async () => {
        await init()
        await browser.setValue('#calibrationForm [name="numPoints"]', '4')
        await browser.click('#calibrationForm [data-test-name="nextButton"]')
        await delay(700)

        expect(await browser.getText('[data-test-name="calibrationFormTitle"]')).to.equal('Step 1 of 4')
      })
    })

    async function setRawInput(rawInput: number | null): Promise<void> {
      const {id} = defaultChannel
      await graphql({
        query: `mutation updateValue($id: Int!, $rawInput: Float) {
          setLocalChannelRawInput(id: $id, rawAnalogInput: $rawInput)
        }
        `,
        operationName: 'updateValue',
        variables: {
          id,
          rawInput,
        }
      })
    }

    it('wizard flow works', async () => {
      await init()
      const {id} = defaultChannel
      await browser.setValue('#calibrationForm [name="numPoints"]', '  2')

      await browser.click('#calibrationForm [data-test-name="nextButton"]')
      await delay(700)

      await Promise.all([
        setRawInput(2.3),
        browser.setValue('#calibrationForm [name="points[0].y"]', ' 4.6'),
      ])
      await delay(100)
      await browser.click('#calibrationForm [data-test-name="nextButton"]')
      await delay(700)

      await Promise.all([
        setRawInput(1.4),
        browser.setValue('#calibrationForm [name="points[1].y"]', ' 7.9  '),
      ])
      await delay(100)
      await browser.click('#calibrationForm [data-test-name="nextButton"]')
      await delay(700)

      expect(await browser.getValue('#calibrationForm [name="points[0].x"]')).to.equal('2.3')
      expect(await browser.getValue('#calibrationForm [name="points[0].y"]')).to.equal('4.6')
      expect(await browser.getValue('#calibrationForm [name="points[1].x"]')).to.equal('1.4')
      expect(await browser.getValue('#calibrationForm [name="points[1].y"]')).to.equal('7.9')

      await browser.click('#calibrationForm [data-test-name="okButton"]')
      await delay(700)
      expect(await browser.getUrl()).to.match(/\/channel\/1$/)

      const {data: {Channel: {config: {calibration}}}} = await graphql({
        query: `query blah($id: Int!) {
          Channel: LocalIOChannel(id: $id) {
            config
          }
        }`,
        variables: {id},
      })

      expect(calibration.points).to.deep.equal([
        {x: 2.3, y: 4.6},
        {x: 1.4, y: 7.9},
      ])
    })

    describe('PointStep', () => {
      it('displays the correct initial values', async () => {
        await init(undefined, 0.7)

        await browser.click('#calibrationForm [data-test-name="nextButton"]')
        await delay(700)

        expect(await browser.getText('[data-test-name="calibrationFormTitle"]')).to.equal('Step 1 of 2')
        expect(await browser.getText('#calibrationForm [data-component="ValueBlock"] [data-test-name="title"]')).to.equal('Raw Input')
        expect(await browser.getText('#calibrationForm [data-component="ValueBlock"] [data-test-name="units"]')).to.equal('V')
        expect(await browser.getText('#calibrationForm [data-component="ValueBlock"] [data-test-name="value"]')).to.equal('0.70')
        expect(await browser.getValue('#calibrationForm [name="points[0].y"]')).to.equal('0')
        expect(await browser.isVisible('#calibrationForm [data-test-name="calibrationTableButton"]')).to.be.false
        expect(await browser.isEnabled('#calibrationForm [data-test-name="backButton"]')).to.be.true
        expect(await browser.isEnabled('#calibrationForm [data-test-name="nextButton"]')).to.be.true

        await browser.click('#calibrationForm [data-test-name="nextButton"]')
        await delay(700)

        expect(await browser.getText('[data-test-name="calibrationFormTitle"]')).to.equal('Step 2 of 2')
        expect(await browser.getText('#calibrationForm [data-component="ValueBlock"] [data-test-name="title"]')).to.equal('Raw Input')
        expect(await browser.getText('#calibrationForm [data-component="ValueBlock"] [data-test-name="units"]')).to.equal('V')
        expect(await browser.getText('#calibrationForm [data-component="ValueBlock"] [data-test-name="value"]')).to.equal('0.70')
        expect(await browser.getValue('#calibrationForm [name="points[1].y"]')).to.equal('10')
        expect(await browser.isVisible('#calibrationForm [data-test-name="calibrationTableButton"]')).to.be.false
        expect(await browser.isEnabled('#calibrationForm [data-test-name="backButton"]')).to.be.true
        expect(await browser.isEnabled('#calibrationForm [data-test-name="nextButton"]')).to.be.true
      })
      it('updates raw input value', async () => {
        await init()
        await browser.click('#calibrationForm [data-test-name="nextButton"]')
        await delay(700)

        expect(await browser.getText('#calibrationForm [data-component="ValueBlock"] [data-test-name="value"]')).to.equal('')

        await setRawInput(2)
        await delay(100)
        expect(await browser.getText('#calibrationForm [data-component="ValueBlock"] [data-test-name="value"]')).to.equal('2.00')

        await setRawInput(3.236)
        await delay(100)
        expect(await browser.getText('#calibrationForm [data-component="ValueBlock"] [data-test-name="value"]')).to.equal('3.24')

        await setRawInput(null)
        await delay(100)
        expect(await browser.getText('#calibrationForm [data-component="ValueBlock"] [data-test-name="value"]')).to.equal('')
      })
      it('validates fields correctly', async () => {
        await init()
        await browser.click('#calibrationForm [data-test-name="nextButton"]')
        await delay(700)

        await browser.setValue('#calibrationForm [name="points[0].y"]', '')
        await browser.click('#calibrationForm [data-test-name="nextButton"]')
        expect(await browser.getText('#calibrationForm [data-component="ValueBlock"] [data-component="FormHelperText"]')).to.equal(
          'is required'
        )
        expect(await browser.getText('#calibrationForm [data-name="points[0].y"] [data-component="FormHelperText"]')).to.equal(
          'is required'
        )

        await browser.setValue('#calibrationForm [name="points[0].y"]', ' 2a')
        expect(await browser.getText('#calibrationForm [data-name="points[0].y"] [data-component="FormHelperText"]')).to.equal(
          'must be a number'
        )
      })
    })

    describe('CalibrationTable', () => {
      it('displays the correct initial values', async () => {
        await init(undefined, 0.7)
        const {id} = defaultChannel
        await navigateTo(`/channel/${id + 1}/calibration/table`)

        expect(await browser.getText('[data-test-name="calibrationFormTitle"]')).to.equal(`Channel ${id + 1} Calibration`)
        expect(await browser.getValue('#calibrationForm [name="points[0].x"]')).to.equal('0')
        expect(await browser.getValue('#calibrationForm [name="points[0].y"]')).to.equal('0')
        expect(await browser.getValue('#calibrationForm [name="points[1].x"]')).to.equal('1')
        expect(await browser.getValue('#calibrationForm [name="points[1].y"]')).to.equal('10')
        expect(await browser.isVisible('#calibrationForm [data-test-name="calibrationTableButton"]')).to.be.false
        expect(await browser.isEnabled('#calibrationForm [data-test-name="backButton"]')).to.be.true
        expect(await browser.isEnabled('#calibrationForm [data-test-name="okButton"]')).to.be.true
      })
      it('performs correct validation', async () => {
        await init()
        const {id} = defaultChannel
        await navigateTo(`/channel/${id + 1}/calibration/table`)
        const fields = ['points[0].x', 'points[0].y', 'points[1].x', 'points[1].y']
        for (let field of fields) {
          await browser.setValue(`[data-component="CalibrationTable"] [name="${field}"]`, '')
        }
        await browser.click('#calibrationForm [data-test-name="okButton"]')

        for (let field of fields) {
          expect(await browser.getText(`[data-component="CalibrationTable"] [data-name="${field}"] [data-component="FormHelperText"]`)).to.equal(
            'is required'
          )
          await browser.setValue(`[data-component="CalibrationTable"] [name="${field}"]`, '  2a')
          expect(await browser.getText(`[data-component="CalibrationTable"] [data-name="${field}"] [data-component="FormHelperText"]`)).to.equal(
            'must be a number'
          )
        }
      })
    })
  })
}

