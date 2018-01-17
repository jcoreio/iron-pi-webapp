// @flow

import {reduxForm} from 'redux-form'
import {compose} from 'redux'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import CalibrationForm from './CalibrationForm'
import createSubscribeToChannelState from '../../apollo/createSubscribeToChannelState'

const channelQuery = gql(`query Channels($id: Int!) {
  Channel(id: $id) {
    id
    channelId
    name
    config
    state
  }
}
`)

const mutationQuery = gql(`
mutation updateCalibration($id: Int!, $calibration: JSON!) {
  updateCalibration(id: $id, calibration: $calibration) {
    id
    config
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
    form: 'Calibration',
  })
)(CalibrationForm)

