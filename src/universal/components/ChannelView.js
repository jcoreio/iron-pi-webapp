// @flow

import * as React from 'react'
import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import {reduxForm, Field, formValues} from 'redux-form/immutable'
import {get} from 'lodash'

export type Props = {
  data: Object,
  subscribeToChannel: (options: {id: number}) => any,
}

class ChannelView extends React.Component<Props> {
  unsubscribe: ?Function = null
  componentWillReceiveProps(nextProps: Props) {
    const id = get(this.props, 'data.channel.id')
    const nextId = get(nextProps, 'data.channel.id')
    if (nextId && nextId !== id) {
      const {subscribeToChannel} = nextProps
      if (this.unsubscribe) this.unsubscribe()
      this.unsubscribe = subscribeToChannel({id: nextId})
    }
  }
  render(): ?React.Node {
    const {data} = this.props
    return (
      <div>
        <form>
          <Field
            name="channelId"
            type="text"
            placeholder="channelId"
            component="input"
          />
        </form>
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </div>
    )
  }
}

const CHANNEL_SUBSCRIPTION = gql`
  subscription onChannelUpdate($id: Int!) {
    Channel(id: $id) {
      update {
        name
        channelId
        mode
      }
    }
  }
`

export default compose(
  reduxForm({form: 'channel', initialValues: {channelId: 'channel1'}}),
  formValues('channelId'),
  graphql(
    gql`
      query Channel($channelId: String!) {
        channel: Channel(channelId: $channelId) {
          id
          name
          channelId
          mode
        }
      }
    `,
    {
      options: ({channelId}) => ({
        variables: {channelId},
      }),
      props: props => ({
        ...props,
        subscribeToChannel: params => props.data.subscribeToMore({
          document: CHANNEL_SUBSCRIPTION,
          variables: {
            id: params.id,
          },
          updateQuery: (prev, {subscriptionData}) => {
            const update = get(subscriptionData, 'data.Channel.update')
            if (!update) return prev

            return {
              ...prev,
              channel: {
                ...prev.channel,
                ...update
              }
            }
          },
        })
      })
    }
  )
)(ChannelView)

