// @flow

import {describe, beforeEach, it} from 'mocha'
import {expect} from 'chai'
import * as React from 'react'
import {mount} from 'enzyme'
import poll from '@jcoreio/poll'

import IntegrationContainer from './IntegrationContainer'
import SidebarContainer from '../../src/universal/components/Sidebar/SidebarContainer'
import Channel from '../../src/server/models/Channel'
import type {ChannelMode} from '../../src/universal/types/Channel'
import {setChannelStates, setChannelValues} from '../../src/server/localio/ChannelStates'
import ChannelStateItem from '../../src/universal/components/Sidebar/ChannelStateItem'
import createApolloClient from './createApolloClient'

describe('Sidebar', () => {
  describe('Local I/O', function () {
    this.timeout(30000)

    let client: ApolloClient
    let close: () => void = () => {}

    beforeEach(async () => {
      var apollo = await createApolloClient()
      client = apollo.client
      close = apollo.close

      await Promise.all([
        'ANALOG_INPUT', 'DIGITAL_INPUT', 'DIGITAL_OUTPUT', 'DISABLED'
      ].map((mode: ChannelMode, index: number) => {
        const id = index + 1
        return Channel.update({
          channelId: `Channel ${id}`,
          name: `Channel ${id}`,
          mode,
        }, {where: {id}})
      }))

      setChannelStates(
        {id: 1, mode: 'ANALOG_INPUT', rawInput: 2.3},
        {id: 2, mode: 'DIGITAL_INPUT', reversePolarity: false, rawInput: 1},
        {id: 3, mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlValue: 1},
      )
    })

    afterEach(() => {
      close()
    })

    it('loads channels from database', async function (): Promise<void> {
      const comp = mount(
        <IntegrationContainer client={client}>
          <SidebarContainer />
        </IntegrationContainer>
      )
      await poll(
        () => {
          const stateItems = comp.update().find(ChannelStateItem)

          expect(stateItems.at(0).prop('channel')).to.containSubset({
            id: 1,
            name: 'Channel 1',
            mode: 'ANALOG_INPUT',
            state: {
              id: 1,
              mode: 'ANALOG_INPUT',
              rawInput: 2.3,
              systemValue: 2.3,
            },
          })
          expect(stateItems.at(1).prop('channel')).to.containSubset({
            id: 2,
            name: 'Channel 2',
            mode: 'DIGITAL_INPUT',
            state: {
              id: 2,
              mode: 'DIGITAL_INPUT',
              reversePolarity: false,
              rawInput: 1,
              systemValue: 1,
            },
          })
          expect(stateItems.at(2).prop('channel')).to.containSubset({
            id: 3,
            name: 'Channel 3',
            mode: 'DIGITAL_OUTPUT',
            state: {
              id: 3,
              mode: 'DIGITAL_OUTPUT',
              reversePolarity: false,
              safeState: 0,
              controlValue: 1,
              rawOutput: 1,
            },
          })
        },
        50
      )
    })

    it('receives ChannelState updates', async function (): Promise<void> {
      const comp = mount(
        <IntegrationContainer client={client}>
          <SidebarContainer />
        </IntegrationContainer>
      )
      setChannelValues(
        {id: 1, rawInput: 2.5},
        {id: 2, rawInput: 0},
      )
      await poll(
        () => {
          const stateItems = comp.update().find(ChannelStateItem)

          expect(stateItems.at(0).prop('channel')).to.containSubset({
            state: {
              id: 1,
              mode: 'ANALOG_INPUT',
              rawInput: 2.5,
              systemValue: 2.5,
            },
          })
          expect(stateItems.at(1).prop('channel')).to.containSubset({
            state: {
              id: 2,
              mode: 'DIGITAL_INPUT',
              reversePolarity: false,
              rawInput: 0,
              systemValue: 0,
            },
          })
          expect(stateItems.at(2).prop('channel')).to.containSubset({
            state: {
              id: 3,
              mode: 'DIGITAL_OUTPUT',
              reversePolarity: false,
              safeState: 0,
              controlValue: 1,
              rawOutput: 1,
            },
          })
        },
        50
      )

      setChannelStates(
        {id: 2, mode: 'DIGITAL_INPUT', reversePolarity: true}
      )
      setChannelValues(
        {id: 3, controlValue: 0}
      )
      await poll(
        () => {
          const stateItems = comp.update().find(ChannelStateItem)

          expect(stateItems.at(0).prop('channel')).to.containSubset({
            state: {
              id: 1,
              mode: 'ANALOG_INPUT',
              rawInput: 2.5,
              systemValue: 2.5,
            },
          })
          expect(stateItems.at(1).prop('channel')).to.containSubset({
            state: {
              id: 2,
              mode: 'DIGITAL_INPUT',
              reversePolarity: true,
              rawInput: 0,
              systemValue: 1,
            },
          })
          expect(stateItems.at(2).prop('channel')).to.containSubset({
            state: {
              id: 3,
              mode: 'DIGITAL_OUTPUT',
              reversePolarity: false,
              safeState: 0,
              controlValue: 0,
              rawOutput: 0,
            },
          })
        },
        50
      )
    })
  })
})

