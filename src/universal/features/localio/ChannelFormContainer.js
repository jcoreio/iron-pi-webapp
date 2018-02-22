// @flow

import {reduxForm, formValues} from 'redux-form'
import {compose} from 'redux'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import ChannelForm from './ChannelForm'
import createSubscribeToChannelState from '../../localio/apollo/createSubscribeToChannelState'
import {ALL_FIELDS_SELECTION as ALL_STATE_FIELDS} from '../../localio/apollo/createSubscribeToChannelState'

const metadataItemSelection = `
metadataItem {
  _id
  tag
  name
  dataType
  ... on NumericMetadataItem {
    min
    max
    units
    storagePrecision
    displayPrecision
  }
  ... on DigitalMetadataItem {
    isDigital
  }
}
`

const channelQuery = gql(`query Channels($id: Int!) {
  Channel: LocalIOChannel(id: $id) {
    id
    config
    state ${ALL_STATE_FIELDS}
    ${metadataItemSelection}
  }
  Metadata {
    _id
    tag
    name
  }
}
`)

const mutationQuery = gql(`
mutation updateChannel($id: Int, $where: JSON, $channel: InputLocalIOChannel!) {
  Channel: updateLocalIOChannel(id: $id, where: $where, channel: $channel) {
    id
    tag
    name
    config
    ${metadataItemSelection}
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
      variables: {id},
      errorPolicy: 'all',
    }),
    props: props => ({
      ...props,
      subscribeToChannelState: createSubscribeToChannelState(props, {
        query: channelQuery,
        channelPath: ['Channel'],
      }),
    })
  }),
  reduxForm({
    form: 'LocalIOChannel',
    destroyOnUnmount: false,
  }),
  formValues({
    config: 'config',
    loadedId: 'id',
  })
)(ChannelForm)

