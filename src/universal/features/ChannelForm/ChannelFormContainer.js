// @flow

import {reduxForm} from 'redux-form'
import {compose} from 'redux'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import ChannelForm from './ChannelForm'
import createSubscribeToChannelState from '../../localio/apollo/createSubscribeToChannelState'

const channelQuery = gql(`query Channels($where: SequelizeJSON!) {
  Channel: LocalIOChannel(where: $where) {
    id
    tag
    config
  }
  Channels: LocalIOChannels {
    id
    tag
  }
}
`)

const mutationQuery = gql(`
mutation updateChannel($id: String, $where: JSON, $channel: InputLocalIOChannel!) {
  updateLocalIOChannel(id: $id, where: $where, channel: $channel) {
    id
    tag
    config
  }
}
`)

type Props = {
  id: number,
}

export default compose(
  graphql(mutationQuery),
  graphql(channelQuery, {
    options: ({id}: Props) => ({
      variables: {
        where: {id}
      },
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

