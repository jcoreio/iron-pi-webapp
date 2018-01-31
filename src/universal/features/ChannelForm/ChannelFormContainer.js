// @flow

import {reduxForm} from 'redux-form'
import {compose} from 'redux'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import ChannelForm from './ChannelForm'
import createSubscribeToChannelState from '../../apollo/createSubscribeToChannelState'

const channelQuery = gql(`query Channels($id: Int!) {
  Channel(id: $id) {
    id
    channelId
    name
    config
    state
  }
  Channels {
    id
    channelId
    name
  }
}
`)

const mutationQuery = gql(`
mutation updateChannel($channel: InputChannel!) {
  updateChannel(channel: $channel) {
    id
    channelId
    name
    config
    state
  }
}
`)

type Props = {
  channelId: number,
}

export default compose(
  graphql(mutationQuery),
  graphql(channelQuery, {
    options: ({channelId}: Props) => ({
      variables: {id: channelId},
      errorPolicy: 'all',
    }),
    props: props => ({
      ...props,
      subscribeToChannelState: createSubscribeToChannelState(props),
    })
  }),
  reduxForm({
    form: 'Channel',
  })
)(ChannelForm)

