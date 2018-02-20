// @flow

import {reduxForm} from 'redux-form'
import {compose} from 'redux'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import CalibrationForm from './CalibrationForm'
import createSubscribeToChannelState from '../../localio/apollo/createSubscribeToChannelState'

const channelQuery = gql(`query Channels($where: SequelizeJSON) {
  Channel(where: $where) {
    physicalChannelId
    id
    name
    config
    state
  }
}
`)

const mutationQuery = gql(`
mutation updateCalibration($id: String!, $calibration: JSON!) {
  updateCalibration(id: $id, calibration: $calibration) {
    id
    config
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
    form: 'Calibration',
  })
)(CalibrationForm)

