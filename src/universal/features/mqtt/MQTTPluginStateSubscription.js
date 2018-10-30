// @flow

import * as React from 'react'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import type {MQTTPluginState} from '../../types/MQTTPluginState'

export type Props = {
  id?: ?number,
  subscribe: (id: number) => Function,
}

class MQTTPluginStateSubscription extends React.Component<Props> {
  _unsubscribe: ?Function = null

  componentDidMount() {
    const {id, subscribe} = this.props
    if (id) this._unsubscribe = subscribe(id)
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const {id, subscribe} = nextProps
    if (id === this.props.id) return
    if (this._unsubscribe) {
      this._unsubscribe()
      this._unsubscribe = null
    }
    if (id) this._unsubscribe = subscribe(id)
  }

  componentWillUnmount() {
    if (this._unsubscribe) this._unsubscribe()
  }

  render(): ?React.Node {
    return null
  }
}

const query = gql(`query ($id: Int!) {
  MQTTPluginState(id: $id) {
    id
    status
    connectedSince
    error
  }
}`)

const subscription = gql(`subscription ($id: Int!) {
  MQTTPluginState(id: $id) {
    id
    status
    connectedSince
    error
  }
}`)

type Data = {
  MQTTPluginState?: MQTTPluginState,
}

export default graphql(query, {
  options: ({id}: Props) => ({
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    variables: {id},
  }),
  props: props => ({
    ...props,
    subscribe: (id: number) => props.data.subscribeToMore({
      document: subscription,
      variables: {id},
      updateQuery: (prev: Data, update: {subscriptionData: {errors?: Array<Error>, data?: Data}}): Data => {
        const {subscriptionData: {data}} = update
        if (!data) return prev
        return {...prev, MQTTPluginState: data.MQTTPluginState}
      },
    }),
  }),
})(MQTTPluginStateSubscription)

