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
import {setChannelStates} from '../../src/server/localio/ChannelStates'
import ChannelStateItem from '../../src/universal/components/Sidebar/ChannelStateItem'
import createApolloClient from './createApolloClient'

describe('Sidebar', () => {
  describe('Local I/O', function () {
    this.timeout(30000)

    let client: ApolloClient
    let close: () => void = () => {}

    beforeEach(async () => {
      var apollo = createApolloClient()
      client = apollo.client
      close = apollo.close

      await Channel.destroy({truncate: true})
      await Channel.bulkCreate([
        'ANALOG_INPUT', 'DIGITAL_INPUT', 'DIGITAL_OUTPUT', 'DISABLED'
      ].map((mode: ChannelMode, id: number) => ({
        id,
        channelId: `channel${id}`,
        name: `Channel ${id}`,
        mode,
      })))
      setChannelStates(
        {id: 0, value: 2.3},
        {id: 1, value: 1},
        {id: 2, value: 1},
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
            id: 0,
            name: 'Channel 0',
            mode: 'ANALOG_INPUT',
            state: {
              id: 0,
              value: 2.3,
            },
          })
          expect(stateItems.at(1).prop('channel')).to.containSubset({
            id: 1,
            name: 'Channel 1',
            mode: 'DIGITAL_INPUT',
            state: {
              id: 1,
              value: 1,
            },
          })
          expect(stateItems.at(2).prop('channel')).to.containSubset({
            id: 2,
            name: 'Channel 2',
            mode: 'DIGITAL_OUTPUT',
            state: {
              id: 2,
              value: 1,
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
      setChannelStates(
        {id: 0, value: 2.5},
        {id: 1, value: 0},
      )
      await poll(
        () => {
          const stateItems = comp.update().find(ChannelStateItem)

          expect(stateItems.at(0).prop('channel')).to.containSubset({
            state: {
              id: 0,
              value: 2.5,
            },
          })
          expect(stateItems.at(1).prop('channel')).to.containSubset({
            state: {
              id: 1,
              value: 0,
            },
          })
          expect(stateItems.at(2).prop('channel')).to.containSubset({
            state: {
              id: 2,
              value: 1,
            },
          })
        },
        50
      )

      setChannelStates(
        {id: 1, value: 1},
        {id: 2, value: 0}
      )
      await poll(
        () => {
          const stateItems = comp.update().find(ChannelStateItem)

          expect(stateItems.at(0).prop('channel')).to.containSubset({
            state: {
              id: 0,
              value: 2.5,
            },
          })
          expect(stateItems.at(1).prop('channel')).to.containSubset({
            state: {
              id: 1,
              value: 1,
            },
          })
          expect(stateItems.at(2).prop('channel')).to.containSubset({
            state: {
              id: 2,
              value: 0,
            },
          })
        },
        50
      )
    })
  })
})

