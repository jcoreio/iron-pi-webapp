// @flow

import * as React from 'react'

export type Props = {
  delay?: ?number,
  children: (props: {time: number}) => ?React.Node,
}

export default class Timer extends React.Component<Props> {
  intervalID: any

  clearIntervalIfNecessary() {
    if (this.intervalID != null) {
      clearInterval(this.intervalID)
      this.intervalID = null
    }
  }

  setIntervalIfNecessary(delay: ?number) {
    if (delay != null && Number.isFinite(delay)) {
      this.intervalID = setInterval(() => this.forceUpdate(), delay)
    }
  }

  componentDidMount() {
    this.setIntervalIfNecessary(this.props.delay)
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (this.props.delay !== nextProps.delay) {
      this.clearIntervalIfNecessary()
      this.setIntervalIfNecessary(nextProps.delay)
    }
  }

  componentWillUnmount() {
    this.clearIntervalIfNecessary()
  }

  render(): ?React.Node {
    const {children} = this.props
    return children({time: Date.now()})
  }
}

