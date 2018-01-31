// @flow

/* global browser */

import {describe, it} from 'mocha'
import {expect} from 'chai'
import delay from 'delay'
import poll from '@jcoreio/poll'
import navigateTo from '../util/navigateTo'
import loginIfNecessary from '../util/loginIfNecessary'
import graphql from '../util/graphql'
import type {Channel} from '../../../src/universal/types/Channel'

module.exports = () => {
  describe('DigitalOutput mode', function () {
    this.timeout(60000)

    const defaultChannel = {
      id: 'channel1',
      physicalChannelId: 1,
      name: 'Channel 1',
      config: {
        mode: 'DIGITAL_OUTPUT',
        safeState: 0,
        reversePolarity: false,
        controlMode: 'REMOTE_CONTROL',
      },
    }

    async function init(channel: Channel & {physicalChannelId: number} = defaultChannel, controlValue: 0 | 1 | null = null): Promise<void> {
      const {physicalChannelId} = defaultChannel
      await graphql({
        query: `mutation prepareTest($where: JSON!, $channel: InputChannel!) {
          updateChannel(where: $where, channel: $channel) {
            physicalChannelId
          }
        }
        `,
        operationName: 'prepareTest',
        variables: {
          where: {physicalChannelId},
          channel: defaultChannel,
        }
      })
      await graphql({
        query: `mutation prepareTest($channelId: String!, $controlValue: Int) {
          setChannelValue(channelId: $channelId, controlValue: $controlValue)
        }
        `,
        operationName: 'prepareTest',
        variables: {
          channelId: channel.id,
          controlValue,
        }
      })
      await navigateTo(`/channel/${channel.physicalChannelId}`)
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
      expect(await browser.getValue('#channelForm [name="id"]')).to.equal('channel1')
    })

    it('displays updated values', async () => {
      await init()

      await graphql({
        query: `mutation update($channel: InputChannel!, $channelId: String!, $controlValue: Int) {
          updateChannel(id: $channelId, channel: $channel) {
            physicalChannelId
          }
          setChannelValue(channelId: $channelId, controlValue: $controlValue)
        }`,
        operationName: 'update',
        variables: {
          channel: {
            physicalChannelId: 1,
            config: {
              mode: 'DIGITAL_OUTPUT',
              safeState: 0,
              reversePolarity: false,
              controlMode: 'REMOTE_CONTROL',
            },
          },
          channelId: 'channel1',
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

    describe('local control mode', () => {
      it('displays the correct initial values for local control', async () => {
        await graphql({
          query: `mutation prepareTest($where: JSON!, $channel: InputChannel!) {
            updateChannel(where: $where, channel: $channel) {
              physicalChannelId
            }
          }
          `,
          operationName: 'prepareTest',
          variables: {
            where: {physicalChannelId: 1},
            channel: {
              name: 'Channel 1',
              id: 'channel1',
              config: {
                mode: 'DIGITAL_OUTPUT',
                safeState: 0,
                reversePolarity: false,
                controlMode: 'LOCAL_CONTROL',
                controlLogic: [
                  {channelId: 'channel2', comparison: 'GTE', threshold: 2.3},
                  {operation: 'OR', channelId: 'channel3', comparison: 'EQ', threshold: 1.5},
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
        expect(await browser.getValue('#channelForm [name="id"]')).to.equal('channel1')
        expect(await browser.getValue('#channelForm [name="config.controlLogic[0].channelId"]')).to.equal('channel2')
        expect(await browser.getValue('#channelForm [name="config.controlLogic[0].comparison"]')).to.equal('GTE')
        expect(await browser.getValue('#channelForm [name="config.controlLogic[0].threshold"]')).to.equal('2.3')
        expect(await browser.getValue('#channelForm [name="config.controlLogic[1].operation"]')).to.equal('OR')
        expect(await browser.getValue('#channelForm [name="config.controlLogic[1].channelId"]')).to.equal('channel3')
        expect(await browser.getValue('#channelForm [name="config.controlLogic[1].comparison"]')).to.equal('EQ')
        expect(await browser.getValue('#channelForm [name="config.controlLogic[1].threshold"]')).to.equal('1.5')
      })
      it('validates logic correctly', async () => {
        await graphql({
          query: `mutation prepareTest($where: JSON!, $channel: InputChannel!) {
            updateChannel(where: $where, channel: $channel) {
              physicalChannelId
            }
          }
          `,
          operationName: 'prepareTest',
          variables: {
            where: {physicalChannelId: 1},
            channel: {
              name: 'Channel 1',
              id: 'channel1',
              config: {
                mode: 'DISABLED',
                controlLogic: [],
              },
            },
          }
        })
        await navigateTo('/channel/1')
        await navigateTo('/channel/1')
        await loginIfNecessary()

        await browser.click('#channelForm [name="config.mode"] [value="DIGITAL_OUTPUT"]')
        await delay(500)
        await browser.click('#channelForm [name="config.controlMode"] [value="LOCAL_CONTROL"]')
        await delay(500)
        await browser.click('#channelForm [name="config.safeState"] [value="0"]')
        await browser.click('#channelForm [name="config.reversePolarity"] [value="false"]')
        await browser.click('#channelForm [type="submit"]')
        expect(await browser.getText('#channelForm [data-component="ControlLogicTable"] [data-component="FormHelperText"]')).to.equal(
          'must have at least one condition'
        )
        await browser.click('#channelForm [data-component="ControlLogicTable"] [data-test-name="addConditionButton"]')
        await browser.click('#channelForm [data-component="ControlLogicTable"] [data-test-name="addConditionButton"]')
        expect(await browser.getValue('#channelForm [name="config.controlLogic[0].comparison"]')).to.equal('GT')
        expect(await browser.getValue('#channelForm [name="config.controlLogic[1].comparison"]')).to.equal('GT')
        await browser.click('#channelForm [type="submit"]')
        expect(await browser.getText('#channelForm [data-name="config.controlLogic[0].channelId"] [data-component="FormHelperText"]')).to.equal(
          'is required'
        )
        expect(await browser.getText('#channelForm [data-name="config.controlLogic[1].channelId"] [data-component="FormHelperText"]')).to.equal(
          'is required'
        )
        expect(await browser.getText('#channelForm [data-name="config.controlLogic[0].threshold"] [data-component="FormHelperText"]')).to.equal(
          'is required'
        )
        expect(await browser.getText('#channelForm [data-name="config.controlLogic[1].threshold"] [data-component="FormHelperText"]')).to.equal(
          'is required'
        )

        await browser.click('#channelForm [data-name="config.controlLogic[0].channelId"]')
        await delay(100)
        await browser.click('[id="menu-config.controlLogic[0].channelId"] [value="channel2"]')
        await delay(300)

        await browser.click('#channelForm [data-name="config.controlLogic[1].channelId"]')
        await delay(100)
        await browser.click('[id="menu-config.controlLogic[1].channelId"] [value="channel3"]')
        await delay(300)

        await browser.setValue('#channelForm [name="config.controlLogic[0].threshold"]', ' 23a')
        await browser.setValue('#channelForm [name="config.controlLogic[1].threshold"]', ' .')

        await browser.click('#channelForm [type="submit"]')

        expect(await browser.isVisible('#channelForm [data-name="config.controlLogic[0].channelId"] [data-component="FormHelperText"]')).to.be.false
        expect(await browser.isVisible('#channelForm [data-name="config.controlLogic[1].channelId"] [data-component="FormHelperText"]')).to.be.false
        expect(await browser.getText('#channelForm [data-name="config.controlLogic[0].threshold"] [data-component="FormHelperText"]')).to.equal(
          'must be a number'
        )
        expect(await browser.getText('#channelForm [data-name="config.controlLogic[1].threshold"] [data-component="FormHelperText"]')).to.equal(
          'must be a number'
        )
      })
      it('saves control logic changes', async () => {
        await Promise.all([
          graphql({
            query: `mutation prepareTest($where: JSON!, $channel: InputChannel!) {
              updateChannel(where: $where, channel: $channel) {
                physicalChannelId
              }
            }
            `,
            operationName: 'prepareTest',
            variables: {
              where: {physicalChannelId: 1},
              channel: {
                name: 'Channel 1',
                id: 'channel1',
                config: {
                  mode: 'DISABLED',
                  controlLogic: [],
                },
              },
            }
          }),
          graphql({
            query: `mutation prepareTest($where: JSON!, $channel: InputChannel!) {
              updateChannel(where: $where, channel: $channel) {
                physicalChannelId
              }
            }
            `,
            operationName: 'prepareTest',
            variables: {
              where: {physicalChannelId: 2},
              channel: {
                name: 'Channel 2',
                id: 'channel2',
                config: {
                  mode: 'DISABLED',
                  controlLogic: [],
                },
              },
            }
          }),
          graphql({
            query: `mutation prepareTest($where: JSON!, $channel: InputChannel!) {
              updateChannel(where: $where, channel: $channel) {
                physicalChannelId
              }
            }
            `,
            operationName: 'prepareTest',
            variables: {
              where: {physicalChannelId: 3},
              channel: {
                name: 'Channel 3',
                id: 'channel3',
                config: {
                  mode: 'DISABLED',
                  controlLogic: [],
                },
              },
            }
          })
        ])
        await navigateTo('/channel/1')
        await navigateTo('/channel/1')
        await loginIfNecessary()

        await browser.click('#channelForm [name="config.mode"] [value="DIGITAL_OUTPUT"]')
        await delay(500)
        await browser.click('#channelForm [name="config.controlMode"] [value="LOCAL_CONTROL"]')
        await delay(500)
        await browser.click('#channelForm [name="config.safeState"] [value="0"]')
        await browser.click('#channelForm [name="config.reversePolarity"] [value="false"]')
        await browser.click('#channelForm [type="submit"]')
        expect(await browser.getText('#channelForm [data-component="ControlLogicTable"] [data-component="FormHelperText"]')).to.equal(
          'must have at least one condition'
        )
        await browser.click('#channelForm [data-component="ControlLogicTable"] [data-test-name="addConditionButton"]')
        await browser.click('#channelForm [data-component="ControlLogicTable"] [data-test-name="addConditionButton"]')

        await browser.click('#channelForm [data-name="config.controlLogic[0].channelId"]')
        await delay(100)
        await browser.click('[id="menu-config.controlLogic[0].channelId"] [value="channel2"]')
        await delay(300)

        await browser.click('#channelForm [data-name="config.controlLogic[0].comparison"]')
        await delay(100)
        await browser.click('[id="menu-config.controlLogic[0].comparison"] [value="EQ"]')
        await delay(300)

        await browser.setValue('#channelForm [name="config.controlLogic[0].threshold"]', ' 23')

        await browser.click('#channelForm [data-name="config.controlLogic[1].operation"]')
        await delay(100)
        await browser.click('[id="menu-config.controlLogic[1].operation"] [value="OR"]')
        await delay(300)

        await browser.click('#channelForm [data-name="config.controlLogic[1].channelId"]')
        await delay(100)
        await browser.click('[id="menu-config.controlLogic[1].channelId"] [value="channel3"]')
        await delay(300)

        await browser.click('#channelForm [data-name="config.controlLogic[1].comparison"]')
        await delay(100)
        await browser.click('[id="menu-config.controlLogic[1].comparison"] [value="LT"]')
        await delay(300)

        await browser.setValue('#channelForm [name="config.controlLogic[1].threshold"]', ' 5.6')

        await browser.click('#channelForm [type="submit"]')
        await delay(500)

        const {data: {Channel: {config}}} = await graphql({
          query: `query {
            Channel(where: {physicalChannelId: 1}) {
              config
            }
          }`
        })

        expect(config).to.containSubset({
          mode: 'DIGITAL_OUTPUT',
          safeState: 0,
          reversePolarity: false,
          controlMode: 'LOCAL_CONTROL',
          controlLogic: [
            {channelId: 'channel2', comparison: 'EQ', threshold: 23},
            {operation: 'OR', channelId: 'channel3', comparison: 'LT', threshold: 5.6},
          ]
        })
      })
    })
  })
}
