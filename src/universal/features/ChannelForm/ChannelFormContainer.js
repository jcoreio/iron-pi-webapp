// @flow

import {reduxForm} from 'redux-form'
import {compose} from 'redux'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import ChannelForm from './ChannelForm'

const channelQuery = gql(`query Channels($id: Int!) {
  Channel(id: $id) {
    id
    channelId
    name
    mode
    config
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
  }),
  reduxForm({
    form: 'Channel',
  })
)(ChannelForm)

