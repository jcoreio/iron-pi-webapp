// @flow

import * as React from 'react'
import {withRouter} from 'react-router-dom'
import type {LocationShape, RouterHistory} from "react-router-dom"

export type Props = {
  history: RouterHistory,
  to: string | LocationShape,
  replace?: boolean,
  children: (props: ChildProps) => React.Node,
}

export type ChildProps = {
  bind: {
    onClick: (e: Event) => any,
  },
}

class WorkaroundLink extends React.Component<Props> {
  _handleClick = () => {
    const {history, to, replace} = this.props
    if (replace) history.replace(to)
    else history.push(to)
  }
  render(): ?React.Node {
    const {children} = this.props
    return children({bind: {onClick: this._handleClick}})
  }
}

export default withRouter((WorkaroundLink: any))

