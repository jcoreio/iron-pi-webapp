// @flow

import * as React from 'react'
import {reduxForm} from 'redux-form'
import type {Match, Location, RouterHistory} from 'react-router-dom'
import {compose} from 'redux'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import CalibrationForm from '../../components/CalibrationForm'
import createSubscribeToChannelState from '../../localio/apollo/createSubscribeToChannelState'
import type {Calibration} from '../../localio/LocalIOChannel'
import {dirname} from "path"
import handleError from '../../redux-form/createSubmissionError'

const channelQuery = gql(`query Channels($id: Int!) {
  Channel: LocalIOChannel(id: $id) {
    id
    name
    config
    metadataItem {
      _id
      ... on NumericMetadataItem {
        units
      }
    }
    state {
      id
      ... on InputChannelState {
        rawInput
      }
    }
  }
}
`)

const mutationQuery = gql(`
mutation updateLocalIOChannelCalibration($id: Int!, $calibration: JSON!) {
  Channel: updateLocalIOChannelCalibration(id: $id, calibration: $calibration) {
    id
    config
  }
}
`)

type InputProps = {
  id: number,
}

type PropsFromRouter = {
  match: Match,
  location: Location,
  history: RouterHistory,
}

type PropsFromForm = {
  initialized: boolean,
  pristine: boolean,
  initialize: (calibration: Calibration) => any,
  change: (field: string, newValue: any) => void,
  error?: string,
}

type PropsFromApollo = {
  subscribeToChannelState: (id: number) => () => void,
  mutate: (options: {variables: {id: number, calibration: Calibration}}) => Promise<{
    data: {
      Channel: {
        id: number,
        config: Object,
      },
    },
  }>,
  data: {
    loading: boolean,
    Channel?: {
      id: number,
      metadataItem?: {
        units?: string,
      },
      config: {
        calibration?: Calibration,
      },
    },
  },
}

type Props = InputProps & PropsFromRouter & PropsFromForm & PropsFromApollo

class CalibrationFormContainer extends React.Component<Props> {
  unsubscribeFromChannelState: ?(() => void)

  componentDidMount() {
    const {id, subscribeToChannelState} = this.props
    this.unsubscribeFromChannelState = subscribeToChannelState(id)
  }
  componentWillReceiveProps(nextProps: Props) {
    const prevChannel = this.props.data.Channel
    const nextChannel = nextProps.data.Channel

    function getId(channel: ?{ id: number }): ?number {
      return channel ? channel.id : null
    }

    if (nextChannel !== prevChannel) {
      if (getId(nextChannel) !== getId(prevChannel)) {
        if (this.unsubscribeFromChannelState) this.unsubscribeFromChannelState()
        if (nextChannel) {
          const {subscribeToChannelState} = nextProps
          if (subscribeToChannelState) {
            this.unsubscribeFromChannelState = subscribeToChannelState(nextChannel.id)
          }
        }
      }
    }
  }
  componentWillUnmount() {
    if (this.unsubscribeFromChannelState) this.unsubscribeFromChannelState()
  }
  saveCalibration = ({points}: Calibration) => {
    const {mutate, id, history, match} = this.props
    return mutate({
      variables: {
        id,
        calibration: {points},
      }
    }).then(
      () => history.push(dirname(match.url)),
      handleError
    )
  }
  render(): React.Node {
    const {id,
      data: {loading, Channel},
      subscribeToChannelState, // eslint-disable-line no-unused-vars
      ...props
    } = this.props
    return (
      <CalibrationForm
        name={`Channel ${id + 1}`}
        loading={loading}
        rawInputUnits="V"
        rawInputPrecision={2}
        units={Channel && Channel.metadataItem && Channel.metadataItem.units}
        calibration={Channel && Channel.config.calibration}
        saveCalibration={this.saveCalibration}
        {...props}
      />
    )
  }
}

export default compose(
  graphql(mutationQuery),
  graphql(channelQuery, {
    options: ({id}: InputProps) => ({
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
    form: 'Calibration',
  })
)(CalibrationFormContainer)

