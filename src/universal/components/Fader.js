// @flow

import * as React from 'react'
import {findDOMNode} from 'react-dom'
import Fader from 'react-fader/lib/withTransitionContext'
import type {Props} from 'react-fader'
import getNodeDimensions from 'get-node-dimensions'

/* eslint-disable react/no-find-dom-node */

function measureHeight(child: any): number {
  const node: any = findDOMNode(child)
  if (node && typeof node.getBoundingClientRect === 'function') {
    return getNodeDimensions(findDOMNode(node), {margin: true}).height
  }
  return 0
}

const DefaultFader = ({children, ...props}: $Shape<Props>): React.Node => (
  <Fader
    measureHeight={measureHeight}
    animateHeight={false}
    {...props}
  >
    {children}
  </Fader>
)

export default DefaultFader

