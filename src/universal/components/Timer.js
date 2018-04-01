// @flow

import * as React from 'react'

export type Props = {
  interval?: ?number,
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

  setIntervalIfNecessary(interval: ?number) {
    if (interval != null && Number.isFinite(interval)) {
      this.intervalID = setInterval(() => this.forceUpdate(), interval)
    }
  }

  componentDidMount() {
    this.setIntervalIfNecessary(this.props.interval)
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.interval !== nextProps.interval) {
      this.clearIntervalIfNecessary()
      this.setIntervalIfNecessary(nextProps.interval)
    }
  }

  componentWillUnmount() {
    this.clearIntervalIfNecessary()
  }

  render(): ?React.Node {
    const {
      interval, // eslint-disable-line no-unused-vars
      children,
      ...props
    } = this.props
    return children({...props, time: Date.now()})
  }
}

