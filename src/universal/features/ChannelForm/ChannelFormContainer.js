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
    mode
    config
    state
  }
  Channels {
    id
    name
  }
}`)

type Props = {
  channelId: number,
}

export default compose(
  graphql(channelQuery, {
    options: ({channelId}: Props) => ({
      variables: {id: channelId}
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

