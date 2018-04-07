// @flow

/* global browser */

import {describe, it} from 'mocha'
import {expect} from 'chai'
import delay from 'delay'
import poll from '@jcoreio/poll'
import navigateTo from '../util/navigateTo'
import loginIfNecessary from '../util/loginIfNecessary'
import graphql from '../util/graphql'
import {CONTROL_MODE_OUTPUT_A_TAG, CONTROL_MODE_CONDITION} from '../../../src/universal/localio/LocalIOChannel'
import type {LocalIOChannel} from '../../../src/universal/localio/LocalIOChannel'

module.exports = () => {
  describe('DigitalOutput mode', function () {
    this.timeout(60000)

    const defaultChannel = {
      id: 0,
      tag: 'channel1',
      metadataItem: {
        tag: 'channel1',
        name: 'Channel 1',
        dataType: 'number',
        isDigital: true,
      },
      config: {
        mode: 'DIGITAL_OUTPUT',
        safeState: 0,
        reversePolarity: false,
        controlMode: CONTROL_MODE_OUTPUT_A_TAG,
      },
    }

    async function init(channel: LocalIOChannel = defaultChannel, controlValue: 0 | 1 | null = null): Promise<void> {
      const {id} = channel
      await graphql({
        query: `mutation prepareTest($id: Int!, $channel: InputLocalIOChannel!) {
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
      await graphql({
        query: `mutation prepareTest($id: Int!, $controlValue: Int) {
          setLocalChannelRemoteControlValue(id: $id, controlValue: $controlValue)
        }
        `,
        operationName: 'prepareTest',
        variables: {
          id,
          controlValue,
        }
      })
      await navigateTo(`/channel/${id + 1}`)
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
      expect(await browser.getAttribute('#channelForm [name="config.controlMode"]', 'data-value')).to.equal(CONTROL_MODE_OUTPUT_A_TAG)
      expect(await browser.getValue('#channelForm [name="metadataItem.name"]')).to.equal('Channel 1')
      expect(await browser.getValue('#channelForm [name="metadataItem.tag"]')).to.equal('channel1')
    })

    it('displays updated values', async () => {
      await init()

      const {id} = defaultChannel

      await graphql({
        query: `mutation update($channel: InputLocalIOChannel!, $id: Int!, $controlValue: Int) {
          updateLocalIOChannel(id: $id, channel: $channel) {
            id
          }
          setLocalChannelRemoteControlValue(id: $id, controlValue: $controlValue)
        }`,
        operationName: 'update',
        variables: {
          id,
          channel: {
            id,
            config: {
              mode: 'DIGITAL_OUTPUT',
              safeState: 0,
              reversePolarity: false,
              controlMode: CONTROL_MODE_OUTPUT_A_TAG,
            },
          },
          controlValue: 1,
        }
      })
      await delay(500)

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
        const {id} = defaultChannel
        await graphql({
          query: `mutation prepareTest($id: Int!, $channel: InputLocalIOChannel!) {
            updateLocalIOChannel(id: $id, channel: $channel) {
              id
            }
          }
          `,
          operationName: 'prepareTest',
          variables: {
            id,
            channel: {
              id,
              metadataItem: {
                tag: 'channel1',
                name: 'Channel 1',
                dataType: 'number',
                isDigital: true,
              },
              config: {
                mode: 'DIGITAL_OUTPUT',
                safeState: 0,
                reversePolarity: false,
                controlMode: CONTROL_MODE_CONDITION,
                controlLogic: [
                  {tag: 'channel2', comparison: 'GTE', setpoint: 2.3},
                  {operator: 'OR', tag: 'channel3', comparison: 'EQ', setpoint: 1.5},
                ]
              },
            },
          }
        })
        await navigateTo(`/channel/${id + 1}`)
        await loginIfNecessary()

        expect(await browser.getAttribute('#channelForm [name="config.mode"]', 'data-value')).to.equal('DIGITAL_OUTPUT')
        expect(await browser.getAttribute('#channelForm [name="config.safeState"]', 'data-value')).to.equal('0')
        expect(await browser.getAttribute('#channelForm [name="config.reversePolarity"]', 'data-value')).to.equal('false')
        expect(await browser.getAttribute('#channelForm [name="config.controlMode"]', 'data-value')).to.equal(CONTROL_MODE_CONDITION)
        expect(await browser.getValue('#channelForm [name="metadataItem.name"]')).to.equal('Channel 1')
        expect(await browser.getValue('#channelForm [name="metadataItem.tag"]')).to.equal('channel1')
        expect(await browser.getValue('#channelForm [name="config.controlLogic[0].tag"]')).to.equal('channel2')
        expect(await browser.getValue('#channelForm [name="config.controlLogic[0].comparison"]')).to.equal('GTE')
        expect(await browser.getValue('#channelForm [name="config.controlLogic[0].setpoint"]')).to.equal('2.3')
        expect(await browser.getValue('#channelForm [name="config.controlLogic[1].operator"]')).to.equal('OR')
        expect(await browser.getValue('#channelForm [name="config.controlLogic[1].tag"]')).to.equal('channel3')
        expect(await browser.getValue('#channelForm [name="config.controlLogic[1].comparison"]')).to.equal('EQ')
        expect(await browser.getValue('#channelForm [name="config.controlLogic[1].setpoint"]')).to.equal('1.5')
      })
      it('validates logic correctly', async () => {
        const {id} = defaultChannel
        await Promise.all([
          await graphql({
            query: `mutation prepareTest($id: Int!, $channel: InputLocalIOChannel!) {
              updateLocalIOChannel(id: $id, channel: $channel) {
                id
              }
            }
            `,
            operationName: 'prepareTest',
            variables: {
              id,
              channel: {
                metadataItem: {
                  tag: 'channel1',
                  name: 'Channel 1',
                  dataType: 'number',
                  isDigital: true,
                },
                config: {
                  mode: 'DIGITAL_OUTPUT',
                  controlMode: CONTROL_MODE_OUTPUT_A_TAG,
                  reversePolarity: false,
                  safeState: 0,
                  controlLogic: [],
                },
              },
            }
          }),
          graphql({
            query: `mutation prepareTest($id: Int!, $channel: InputLocalIOChannel!) {
              updateLocalIOChannel(id: $id, channel: $channel) {
                id
              }
            }
            `,
            operationName: 'prepareTest',
            variables: {
              id: 1,
              channel: {
                metadataItem: {
                  tag: 'channel2',
                  name: 'Channel 2',
                  dataType: 'number',
                  isDigital: true,
                },
                config: {
                  mode: 'DISABLED',
                  controlLogic: [],
                },
              },
            }
          }),
          graphql({
            query: `mutation prepareTest($id: Int!, $channel: InputLocalIOChannel!) {
              updateLocalIOChannel(id: $id, channel: $channel) {
                id
              }
            }
            `,
            operationName: 'prepareTest',
            variables: {
              id: 2,
              channel: {
                metadataItem: {
                  tag: 'channel3',
                  name: 'Channel 3',
                  dataType: 'number',
                  isDigital: true,
                },
                config: {
                  mode: 'DISABLED',
                  controlLogic: [],
                },
              },
            }
          })
        ])
        await navigateTo(`/channel/${id + 1}`)
        await loginIfNecessary()

        await browser.click('#channelForm [name="config.controlMode"] [value="CONDITION"]')
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
        expect(await browser.getText('#channelForm [data-name="config.controlLogic[0].tag"] [data-component="FormHelperText"]')).to.equal(
          'is required'
        )
        expect(await browser.getText('#channelForm [data-name="config.controlLogic[1].tag"] [data-component="FormHelperText"]')).to.equal(
          'is required'
        )
        expect(await browser.getText('#channelForm [data-name="config.controlLogic[0].setpoint"] [data-component="FormHelperText"]')).to.equal(
          'is required'
        )
        expect(await browser.getText('#channelForm [data-name="config.controlLogic[1].setpoint"] [data-component="FormHelperText"]')).to.equal(
          'is required'
        )

        await browser.click('#channelForm [data-name="config.controlLogic[0].tag"]')
        await delay(100)
        await browser.click('[id="menu-config.controlLogic[0].tag"] [data-value="channel2"]')
        await delay(300)

        await browser.click('#channelForm [data-name="config.controlLogic[1].tag"]')
        await delay(100)
        await browser.click('[id="menu-config.controlLogic[1].tag"] [data-value="channel3"]')
        await delay(300)

        await browser.setValue('#channelForm [name="config.controlLogic[0].setpoint"]', ' 23a')
        await browser.setValue('#channelForm [name="config.controlLogic[1].setpoint"]', ' .')

        await browser.click('#channelForm [type="submit"]')

        expect(await browser.isVisible('#channelForm [data-name="config.controlLogic[0].tag"] [data-component="FormHelperText"]')).to.be.false
        expect(await browser.isVisible('#channelForm [data-name="config.controlLogic[1].tag"] [data-component="FormHelperText"]')).to.be.false
        expect(await browser.getText('#channelForm [data-name="config.controlLogic[0].setpoint"] [data-component="FormHelperText"]')).to.equal(
          'must be a number'
        )
        expect(await browser.getText('#channelForm [data-name="config.controlLogic[1].setpoint"] [data-component="FormHelperText"]')).to.equal(
          'must be a number'
        )
      })
      it('saves control logic changes', async () => {
        const {id} = defaultChannel
        await Promise.all([
          graphql({
            query: `mutation prepareTest($id: Int!, $channel: InputLocalIOChannel!) {
              updateLocalIOChannel(id: $id, channel: $channel) {
                id
              }
            }
            `,
            operationName: 'prepareTest',
            variables: {
              id,
              channel: {
                metadataItem: {
                  tag: 'channel1',
                  name: 'Channel 1',
                  dataType: 'number',
                  isDigital: true,
                },
                config: {
                  mode: 'DIGITAL_OUTPUT',
                  controlMode: CONTROL_MODE_OUTPUT_A_TAG,
                  reversePolarity: false,
                  safeState: 0,
                  controlLogic: [],
                },
              },
            }
          }),
          graphql({
            query: `mutation prepareTest($id: Int!, $channel: InputLocalIOChannel!) {
              updateLocalIOChannel(id: $id, channel: $channel) {
                id
              }
            }
            `,
            operationName: 'prepareTest',
            variables: {
              id: 1,
              channel: {
                metadataItem: {
                  tag: 'channel2',
                  name: 'Channel 2',
                  dataType: 'number',
                  isDigital: true,
                },
                config: {
                  mode: 'DISABLED',
                  controlLogic: [],
                },
              },
            }
          }),
          graphql({
            query: `mutation prepareTest($id: Int!, $channel: InputLocalIOChannel!) {
              updateLocalIOChannel(id: $id, channel: $channel) {
                id
              }
            }
            `,
            operationName: 'prepareTest',
            variables: {
              id: 2,
              channel: {
                metadataItem: {
                  tag: 'channel3',
                  name: 'Channel 3',
                  dataType: 'number',
                  isDigital: true,
                },
                config: {
                  mode: 'DISABLED',
                  controlLogic: [],
                },
              },
            }
          })
        ])
        await navigateTo(`/channel/${id + 1}`)
        await loginIfNecessary()

        await browser.click('#channelForm [name="config.controlMode"] [value="CONDITION"]')
        await delay(500)
        await browser.click('#channelForm [name="config.safeState"] [value="0"]')
        await browser.click('#channelForm [name="config.reversePolarity"] [value="false"]')
        await browser.click('#channelForm [type="submit"]')
        expect(await browser.getText('#channelForm [data-component="ControlLogicTable"] [data-component="FormHelperText"]')).to.equal(
          'must have at least one condition'
        )
        await browser.click('#channelForm [data-component="ControlLogicTable"] [data-test-name="addConditionButton"]')
        await browser.click('#channelForm [data-component="ControlLogicTable"] [data-test-name="addConditionButton"]')

        await browser.click('#channelForm [data-name="config.controlLogic[0].tag"]')
        await delay(100)
        await browser.click('[id="menu-config.controlLogic[0].tag"] [data-value="channel2"]')
        await delay(300)

        await browser.click('#channelForm [data-name="config.controlLogic[0].comparison"]')
        await delay(100)
        await browser.click('[id="menu-config.controlLogic[0].comparison"] [data-value="EQ"]')
        await delay(300)

        await browser.setValue('#channelForm [name="config.controlLogic[0].setpoint"]', ' 23')

        await browser.click('#channelForm [data-name="config.controlLogic[1].operator"]')
        await delay(100)
        await browser.click('[id="menu-config.controlLogic[1].operator"] [data-value="OR"]')
        await delay(300)

        await browser.click('#channelForm [data-name="config.controlLogic[1].tag"]')
        await delay(100)
        await browser.click('[id="menu-config.controlLogic[1].tag"] [data-value="channel3"]')
        await delay(300)

        await browser.click('#channelForm [data-name="config.controlLogic[1].comparison"]')
        await delay(100)
        await browser.click('[id="menu-config.controlLogic[1].comparison"] [data-value="LT"]')
        await delay(300)

        await browser.setValue('#channelForm [name="config.controlLogic[1].setpoint"]', ' 5.6')

        await browser.click('#channelForm [type="submit"]')
        await delay(500)

        const {data: {Channel: {config}}} = await graphql({
          query: `query blah($id: Int!) {
            Channel: LocalIOChannel(id: $id) {
              config
            }
          }`,
          variables: {id},
        })

        expect(config).to.containSubset({
          mode: 'DIGITAL_OUTPUT',
          safeState: 0,
          reversePolarity: false,
          controlMode: CONTROL_MODE_CONDITION,
          controlLogic: [
            {tag: 'channel2', comparison: 'EQ', setpoint: 23},
            {operator: 'OR', tag: 'channel3', comparison: 'LT', setpoint: 5.6},
          ]
        })
      })
    })
  })
}
