// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles} from 'material-ui/styles'
import type {ChannelState} from '../../types/Channel'
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
  state?: ChannelState,
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

const ChannelStateIcon = withStyles(styles, {withTheme: true})(
  ({channel: {state}, classes}: Props) => (
    <div
      className={classNames(classes.root, {
        [classes.rootDisabled]: state == null || state.mode === 'DISABLED',
        [classes.rootAnalogInput]: state != null && state.mode === 'ANALOG_INPUT',
        [classes.rootOutput]: state != null && state.mode === 'DIGITAL_OUTPUT',
        [classes.rootOn]: getDigitalValue(state) === 1,
        [classes.rootOff]: getDigitalValue(state) === 0,
      })}
    >
    </div>
  )
)

export default ChannelStateIcon

