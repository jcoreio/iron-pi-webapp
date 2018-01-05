// @flow

import * as React from 'react'
import TextStateWidget from './TextStateWidget'

export type Props = {
  className?: string,
  channel: any,
}

const DisabledStateWidget = ({channel, ...props}: Props): React.Node => (
  <TextStateWidget {...props}>
    Channel is disabled
  </TextStateWidget>
)

export default DisabledStateWidget

