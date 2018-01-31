// @flow

import {reduxForm} from 'redux-form'
import {compose} from 'redux'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import ChannelForm from './ChannelForm'
import createSubscribeToChannelState from '../../apollo/createSubscribeToChannelState'

const channelQuery = gql(`query Channels($where: SequelizeJSON!) {
  Channel(where: $where) {
    physicalChannelId
    id
    name
    config
    state
  }
  Channels {
    physicalChannelId
    id
    name
  }
}
`)

const mutationQuery = gql(`
mutation updateChannel($id: String, $where: JSON, $channel: InputChannel!) {
  updateChannel(id: $id, where: $where, channel: $channel) {
    physicalChannelId
    id
    name
    config
    state
  }
}
`)

type Props = {
  physicalChannelId: number,
}

export default compose(
  graphql(mutationQuery),
  graphql(channelQuery, {
    options: ({physicalChannelId}: Props) => ({
      variables: {
        where: {physicalChannelId}
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

