// @flow

import * as React from 'react'
import Fader from 'react-fader/lib/withTransitionContext'
import type {Props} from 'react-fader'

const DefaultFader = ({children, ...props}: $Shape<Props>): React.Node => (
  <Fader
    animateHeight={false}
    {...props}
  >
    {children}
  </Fader>
)

export default DefaultFader

