// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles} from 'material-ui/styles'
import type {ChannelMode} from '../../types/Channel'
import type {Theme} from '../../theme'

const styles = (theme: Theme) => ({
  root: {
    display: 'inline-block',
    width: theme.spacing.unit * 2,
    height: theme.spacing.unit * 2,
    borderRadius: theme.spacing.unit / 2,
  },
  rootDisabled: {
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
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Channel = {
  mode: ChannelMode,
  state?: {
    value: number,
  },
}

export type Props = {
  classes: Classes,
  channel: Channel,
}

function isDigital(mode: ChannelMode): boolean {
  return mode === 'DIGITAL_INPUT' || mode === 'DIGITAL_OUTPUT'
}

const ChannelStateIcon = withStyles(styles, {withTheme: true})(
  ({channel, classes}: Props) => (
    <div
      className={classNames(classes.root, {
        [classes.rootDisabled]: channel.mode === 'DISABLED',
        [classes.rootAnalogInput]: channel.mode === 'ANALOG_INPUT',
        [classes.rootOutput]: channel.mode === 'DIGITAL_OUTPUT',
        [classes.rootOn]: isDigital(channel.mode) && channel.state && channel.state.value === 1,
        [classes.rootOff]: isDigital(channel.mode) && !(channel.state && channel.state.value === 1),
      })}
    >
    </div>
  )
)

export default ChannelStateIcon

