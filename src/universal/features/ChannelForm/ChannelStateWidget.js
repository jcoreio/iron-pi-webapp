// @flow

import * as React from 'react'
import type {ChannelConfig, ChannelMode, ChannelState} from '../../types/Channel'

import Spinner from '../../components/Spinner'
import TextStateWidget from './TextStateWidget'
import AnalogInputStateWidget from './AnalogInputStateWidget'
import DisabledStateWidget from './DisabledStateWidget'
import DigitalInputStateWidget from './DigitalInputStateWidget'
import DigitalOutputStateWidget from './DigitalOutputStateWidget'

export type Props = {
  className?: string,
  channel: {
    config: ChannelConfig,
    state?: ChannelState,
  },
}

const widgets: {[mode: ChannelMode]: React.ComponentType<Props>} = {
  ANALOG_INPUT: AnalogInputStateWidget,
  DIGITAL_INPUT: DigitalInputStateWidget,
  DIGITAL_OUTPUT: DigitalOutputStateWidget,
  DISABLED: DisabledStateWidget,
}

const ChannelStateWidget = ({channel, ...props}: Props): React.Node => {
  const {config: {mode}, state} = channel
  if (!state || mode !== state.mode) {
    return (
      <TextStateWidget key="updating" {...props}>
        <Spinner /> Channel state is updating...
      </TextStateWidget>
    )
  } else {
    const Widget = widgets[state.mode]
    return <Widget key={state.mode} channel={channel} {...props} />
  }
}

export default ChannelStateWidget

