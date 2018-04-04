// @flow

import * as React from 'react'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'

export type Props = {
  tag?: ?string,
  subscribeToTag: (tag: string) => Function,
}

class TagStateSubscription extends React.Component<Props> {
  _unsubscribe: ?Function = null

  componentDidMount() {
    const {tag, subscribeToTag} = this.props
    if (tag) this._unsubscribe = subscribeToTag(tag)
  }

  componentWillReceiveProps(nextProps: Props) {
    const {tag, subscribeToTag} = nextProps
    if (tag === this.props.tag) return
    if (this._unsubscribe) {
      this._unsubscribe()
      this._unsubscribe = null
    }
    if (tag) this._unsubscribe = subscribeToTag(tag)
  }

  componentWillUnmount() {
    if (this._unsubscribe) this._unsubscribe()
  }

  render(): ?React.Node {
    return null
  }
}

const query = gql(`query ($tag: String!) {
  TagState(tag: $tag) {
    tag
    v
  }
}`)

const subscription = gql(`subscription ($tag: String!) {
  TagState(tag: $tag) {
    tag
    v
  }
}`)

type Data = {
  TagState?: {
    tag: string,
    v: any,
  },
}

export default graphql(query, {
  options: ({tag}: Props) => ({
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    variables: {tag},
  }),
  props: props => ({
    ...props,
    subscribeToTag: (tag: string) => props.data.subscribeToMore({
      document: subscription,
      variables: {tag},
      updateQuery: (prev: Data, update: {subscriptionData: {errors?: Array<Error>, data?: Data}}): Data => {
        const {subscriptionData: {data}} = update
        if (!data) return prev
        return {...prev, TagState: data.TagState}
      },
    }),
  }),
})(TagStateSubscription)

