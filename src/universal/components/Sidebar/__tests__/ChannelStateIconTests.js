// @flow

/* eslint-disable react/no-find-dom-node */
/* eslint-env browser */

import * as React from 'react'
import {findDOMNode} from 'react-dom'
import {describe, it} from 'mocha'
import {expect} from 'chai'
import {mount} from 'enzyme'
import {MuiThemeProvider} from 'material-ui/styles'
import color from 'css-color-converter'

import theme from '../../../theme'

import ChannelStateIcon from '../ChannelStateIcon'
import type {Channel} from '../ChannelStateIcon'

type ExtractWrapper = <T>(mount: (elem: React.Element<any>) => T) => T
type Wrapper = $Call<ExtractWrapper, typeof mount>

function setup(channel: Channel): {node: HTMLElement, comp: Wrapper} {
  let icon: ?React.ElementRef<'div'>
  const comp = mount(
    <MuiThemeProvider theme={theme}>
      <ChannelStateIcon
        ref={c => icon = c}
        channel={channel}
      />
    </MuiThemeProvider>
  )

  const node = findDOMNode(icon)
  if (!node) throw new Error('could not find DOM node')
  if (!(node instanceof HTMLElement)) throw new Error('expected node to be an HTMLElement')

  return {node, comp}
}

describe('ChannelStateIcon', () => {
  describe('for DISABLED channel', () => {
    it('renders hollow border', () => {
      const {node} = setup({
        state: {
          id: 0,
          mode: 'DISABLED',
        },
      })
      const computedStyle = getComputedStyle(node)
      expect(color(computedStyle.borderColor).toHexString()).to.equal(theme.channelState.off)
      expect(computedStyle.backgroundColor).to.equal('')
    })
  })
  describe('for DIGITAL_INPUT channel', () => {
    it('renders correct border width', () => {
      const {node} = setup({
        state: {
          id: 0,
          mode: 'DIGITAL_INPUT',
          reversePolarity: false,
          rawInput: 0,
          systemValue: 0,
        },
      })
      const computedStyle = getComputedStyle(node)
      expect(computedStyle.borderRadius).to.equal(`${theme.spacing.unit / 2}px`)
    })
    it('renders off color correctly', () => {
      const {node} = setup({
        state: {
          id: 0,
          mode: 'DIGITAL_INPUT',
          reversePolarity: false,
          rawInput: 0,
          systemValue: 0,
        },
      })
      const computedStyle = getComputedStyle(node)
      expect(color(computedStyle.backgroundColor).toHexString()).to.equal(theme.channelState.off)
    })
    it('renders on color correctly', () => {
      const {node} = setup({
        state: {
          id: 0,
          mode: 'DIGITAL_INPUT',
          reversePolarity: true,
          rawInput: 0,
          systemValue: 1,
        },
      })
      const computedStyle = getComputedStyle(node)
      expect(color(computedStyle.backgroundColor).toHexString()).to.equal(theme.channelState.on)
    })
  })
  describe('for DIGITAL_OUTPUT channel', () => {
    it('renders correct border width', () => {
      const {node} = setup({
        state: {
          id: 0,
          mode: 'DIGITAL_OUTPUT',
          reversePolarity: false,
          safeState: 0,
          controlValue: 0,
          rawOutput: 0,
        },
      })
      const computedStyle = getComputedStyle(node)
      expect(computedStyle.borderRadius).to.equal('100%')
    })
    it('renders off color correctly', () => {
      const {node} = setup({
        state: {
          id: 0,
          mode: 'DIGITAL_OUTPUT',
          reversePolarity: false,
          safeState: 0,
          controlValue: 0,
          rawOutput: 0,
        },
      })
      const computedStyle = getComputedStyle(node)
      expect(color(computedStyle.backgroundColor).toHexString()).to.equal(theme.channelState.off)
    })
    it('renders on color correctly', () => {
      const {node} = setup({
        state: {
          id: 0,
          mode: 'DIGITAL_OUTPUT',
          reversePolarity: true,
          safeState: 0,
          controlValue: 0,
          rawOutput: 1,
        },
      })
      const computedStyle = getComputedStyle(node)
      expect(color(computedStyle.backgroundColor).toHexString()).to.equal(theme.channelState.on)
    })
  })
})
