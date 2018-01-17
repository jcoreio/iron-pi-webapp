// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles} from 'material-ui/styles'
import type {ChannelMode, ChannelState} from '../../types/Channel'
import type {Theme} from '../../theme'

const styles = (theme: Theme) => ({
  root: {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-block',
    width: theme.spacing.unit * 2,
    height: theme.spacing.unit * 2,
    borderRadius: theme.spacing.unit / 2,
  },
  rootDisabled: {
  },
  rootMissing: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: theme.channelState.off,
  },
  rootOn: {
    backgroundColor: theme.channelState.on,
  },
  rootOff: {
    backgroundColor: theme.channelState.off,
  },
  rootAnalogInput: {
    width: theme.spacing.unit * 3,
    backgroundColor: theme.channelState.off,
  },
  rootOutput: {
    borderRadius: '100%',
  },
  bar: {
    backgroundColor: theme.channelState.on,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Channel = {
  state?: ChannelState,
  config?: {
    mode: ChannelMode,
    min?: number,
    max?: number,
  },
}

export type Props = {
  classes: Classes,
  channel: Channel,
}

function getDigitalValue(state: ?ChannelState): 0 | 1 | null {
  if (!state) return null
  switch (state.mode) {
  case 'DIGITAL_INPUT':
    return state.systemValue
  case 'DIGITAL_OUTPUT':
    return state.rawOutput
  }
  return null
}

function percent(value: number): string {
  if (value <= 0) return '0%'
  if (value >= 1) return '100%'
  return `${(value * 100).toFixed(0)}%`
}

const ChannelStateIcon = ({channel: {config, state}, classes}: Props) => {
  const isDigital = state != null && (state.mode === 'DIGITAL_INPUT' || state.mode === 'DIGITAL_OUTPUT')
  let children
  if (config && config.mode === 'ANALOG_INPUT' && state != null && state.mode === 'ANALOG_INPUT') {
    const {systemValue} = state
    const {min, max} = config
    if (min != null && max != null && systemValue != null &&
      Number.isFinite(min) && Number.isFinite(max) && Number.isFinite(systemValue)) {
      let zero = (0 - min) / (max - min)
      let value = (systemValue - min) / (max - min)
      const left = Math.min(zero, value)
      const right = 1 - Math.max(zero, value)
      children = (
        <div
          className={classes.bar}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: percent(left),
            right: percent(right),
          }}
        />
      )
    }
  }
  return (
    <div
      className={classNames(classes.root, {
        [classes.rootDisabled]: state == null || state.mode === 'DISABLED',
        [classes.rootAnalogInput]: state != null && state.mode === 'ANALOG_INPUT',
        [classes.rootOutput]: state != null && state.mode === 'DIGITAL_OUTPUT',
        [classes.rootMissing]: (isDigital && getDigitalValue(state) == null),
        [classes.rootOn]: getDigitalValue(state) === 1,
        [classes.rootOff]: getDigitalValue(state) === 0,
      })}
    >
      {children}
    </div>
  )
}

export default withStyles(styles, {withTheme: true})(ChannelStateIcon)

