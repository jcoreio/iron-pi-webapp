// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles} from 'material-ui/styles'
import type {ChannelMode} from '../../localio/LocalIOChannel'
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
  state?: {
    mode: ChannelMode,
    systemValue?: ?number,
  },
  metadataItem?: {
    min?: number,
    max?: number,
  },
}

export type Props = {
  classes: Classes,
  channel: Channel,
}

function percent(value: number): string {
  if (value <= 0) return '0%'
  if (value >= 1) return '100%'
  return `${(value * 100).toFixed(0)}%`
}

const ChannelStateIcon = ({channel: {metadataItem, state}, classes}: Props) => {
  const {mode, systemValue} = state || {mode: 'DISABLED', systemValue: null}
  const isDigital = mode === 'DIGITAL_INPUT' || mode === 'DIGITAL_OUTPUT'
  let children
  if (mode === 'ANALOG_INPUT') {
    const {min, max} = metadataItem || {min: null, max: null}
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
        [classes.rootDisabled]: mode === 'DISABLED',
        [classes.rootAnalogInput]: mode === 'ANALOG_INPUT',
        [classes.rootOutput]: mode === 'DIGITAL_OUTPUT',
        [classes.rootMissing]: isDigital && systemValue == null,
        [classes.rootOn]: isDigital && systemValue === 1,
        [classes.rootOff]: isDigital && systemValue === 0,
      })}
    >
      {children}
    </div>
  )
}

export default withStyles(styles, {withTheme: true})(ChannelStateIcon)

