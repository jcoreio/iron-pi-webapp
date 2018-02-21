// @flow

/* eslint-disable react/no-find-dom-node */
/* eslint-env browser */

import * as React from 'react'
import {JssProvider} from 'react-jss'
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
    <JssProvider>
      <MuiThemeProvider theme={theme}>
        <ChannelStateIcon
          ref={c => icon = c}
          channel={channel}
        />
      </MuiThemeProvider>
    </JssProvider>
  )

  const node = findDOMNode(icon)
  if (!node) throw new Error('could not find DOM node')
  if (!(node instanceof HTMLElement)) throw new Error('expected node to be an HTMLElement')

  return {node, comp}
}

describe('ChannelStateIcon', () => {
  describe('for DISABLED channel', () => {
    it('renders nothing', () => {
      const {node} = setup({
        state: {
          channelId: '1',
          mode: 'DISABLED',
        },
      })
      const computedStyle = getComputedStyle(node)
      expect(computedStyle.borderColor).to.equal('')
      expect(computedStyle.backgroundColor).to.equal('')
    })
  })
  describe('for ANALOG_INPUT channel', () => {
    it('renders correct basic state', () => {
      const {node} = setup({
        config: {
          mode: 'ANALOG_INPUT',
          precision: 0,
          min: -10,
          max: 10,
        },
        state: {
          channelId: '1',
          mode: 'ANALOG_INPUT',
          rawInput: 5,
          systemValue: 5,
        },
      })
      const computedStyle = getComputedStyle(node)
      expect(computedStyle.borderRadius).to.equal(`${theme.spacing.unit / 2}px`)
      expect(computedStyle.width).to.equal(`${theme.spacing.unit * 3}px`)
      expect(color(computedStyle.backgroundColor).toHexString()).to.equal(theme.channelState.off)

      const bar = node.children[0]
      if (!bar) throw new Error("couldn't find bar element")
      const barStyle = getComputedStyle(bar)
      expect(color(barStyle.backgroundColor).toHexString()).to.equal(theme.channelState.on)
    })
    it('renders positive value correctly with zero in the middle', () => {
      const {node} = setup({
        config: {
          mode: 'ANALOG_INPUT',
          precision: 0,
          min: -10,
          max: 10,
        },
        state: {
          channelId: '1',
          mode: 'ANALOG_INPUT',
          rawInput: 5,
          systemValue: 5,
        },
      })
      const bar = node.children[0]
      if (!bar) throw new Error("couldn't find bar element")
      const computedStyle = getComputedStyle(bar)
      expect(computedStyle.left).to.equal('50%')
      expect(computedStyle.right).to.equal('25%')
    })
    it('renders negative value correctly with zero in the middle', () => {
      const {node} = setup({
        config: {
          mode: 'ANALOG_INPUT',
          precision: 0,
          min: -10,
          max: 10,
        },
        state: {
          channelId: '1',
          mode: 'ANALOG_INPUT',
          rawInput: -4,
          systemValue: -4,
        },
      })
      const bar = node.children[0]
      if (!bar) throw new Error("couldn't find bar element")
      const computedStyle = getComputedStyle(bar)
      expect(computedStyle.left).to.equal('30%')
      expect(computedStyle.right).to.equal('50%')
    })
    it('renders positive value correctly with zero beyond left', () => {
      const {node} = setup({
        config: {
          mode: 'ANALOG_INPUT',
          precision: 0,
          min: 2,
          max: 6,
        },
        state: {
          channelId: '1',
          mode: 'ANALOG_INPUT',
          rawInput: 4,
          systemValue: 4,
        },
      })
      const bar = node.children[0]
      if (!bar) throw new Error("couldn't find bar element")
      const computedStyle = getComputedStyle(bar)
      expect(computedStyle.left).to.equal('0%')
      expect(computedStyle.right).to.equal('50%')
    })
    it('renders negative value correctly with zero beyond right', () => {
      const {node} = setup({
        config: {
          mode: 'ANALOG_INPUT',
          precision: 0,
          min: -6,
          max: -2,
        },
        state: {
          channelId: '1',
          mode: 'ANALOG_INPUT',
          rawInput: -4,
          systemValue: -4,
        },
      })
      const bar = node.children[0]
      if (!bar) throw new Error("couldn't find bar element")
      const computedStyle = getComputedStyle(bar)
      expect(computedStyle.left).to.equal('50%')
      expect(computedStyle.right).to.equal('0%')
    })
  })
  describe('for DIGITAL_INPUT channel', () => {
    it('renders correct border width', () => {
      const {node} = setup({
        state: {
          channelId: '1',
          mode: 'DIGITAL_INPUT',
          reversePolarity: false,
          rawInput: 0,
          systemValue: 0,
        },
      })
      const computedStyle = getComputedStyle(node)
      expect(computedStyle.borderRadius).to.equal(`${theme.spacing.unit / 2}px`)
    })
    it('renders missing correctly', () => {
      const {node} = setup({
        state: {
          channelId: '1',
          mode: 'DIGITAL_INPUT',
          reversePolarity: false,
          rawInput: null,
          systemValue: null,
        },
      })
      const computedStyle = getComputedStyle(node)
      expect(color(computedStyle.borderColor).toHexString()).to.equal(theme.channelState.off)
      expect(computedStyle.backgroundColor).to.equal('')
    })
    it('renders off color correctly', () => {
      const {node} = setup({
        state: {
          channelId: '1',
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
          channelId: '1',
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
          channelId: '1',
          mode: 'DIGITAL_OUTPUT',
          reversePolarity: false,
          safeState: 0,
          controlMode: 'REMOTE_CONTROL',
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
          channelId: '1',
          mode: 'DIGITAL_OUTPUT',
          reversePolarity: false,
          safeState: 0,
          controlMode: 'REMOTE_CONTROL',
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
          channelId: '1',
          mode: 'DIGITAL_OUTPUT',
          reversePolarity: true,
          safeState: 0,
          controlMode: 'REMOTE_CONTROL',
          controlValue: 0,
          rawOutput: 1,
        },
      })
      const computedStyle = getComputedStyle(node)
      expect(color(computedStyle.backgroundColor).toHexString()).to.equal(theme.channelState.on)
    })
  })
})
