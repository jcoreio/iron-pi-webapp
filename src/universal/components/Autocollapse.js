// @flow

import * as React from 'react'
import {Collapse} from '@jcoreio/rubix'

export type Props = {
  children?: any,
}

export type State = {
  hasChildren: boolean,
  children: any,
}

export default class Autocollapse extends React.Component<Props, State> {
  state: State

  constructor(props: Props) {
    super(props)
    const children = React.Children.toArray(props.children).filter(c => Boolean(c))
    this.state = {
      hasChildren: children.length > 0,
      children,
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const children = React.Children.toArray(nextProps.children).filter(c => Boolean(c))
    this.setState({
      hasChildren: children.length > 0,
      children: children.length ? children : this.state.children,
    })
  }

  render(): React.Node {
    const {hasChildren, children} = this.state

    return (
      <Collapse in={hasChildren}>
        {children.length === 1 ? children[0] : <div>{children}</div>}
      </Collapse>
    )
  }
}


