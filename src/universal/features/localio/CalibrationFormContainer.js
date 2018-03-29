// @flow

import * as React from 'react'
import {reduxForm} from 'redux-form'
import type {Match, Location, RouterHistory} from 'react-router-dom'
import {compose} from 'redux'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import CalibrationForm from '../../components/CalibrationForm'
import type {Calibration} from '../../localio/LocalIOChannel'
import * as LocalIOTags from '../../localio/LocalIOTags'
import {dirname} from "path"
import handleError from '../../redux-form/createSubmissionError'
import createSubscribeToTagValue from '../../apollo/createSubscribeToTagValue'

const channelQuery = gql(`query Channels($id: Int!, $rawInputTag: String!) {
  Channel: LocalIOChannel(id: $id) {
    id
    name
    config
    metadataItem {
      tag
      units
    }
  }
  rawInput: TagValue(tag: $rawInputTag)
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
    rawInput?: ?number,
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
      data: {loading, Channel, rawInput},
      ...props
    } = this.props
    return (
      <CalibrationForm
        name={`Channel ${id + 1}`}
        loading={loading}
        rawInput={rawInput}
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
      variables: {
        id,
        rawInputTag: LocalIOTags.rawAnalogInput(id),
      },
      errorPolicy: 'all',
    }),
    props: props => ({
      ...props,
      subscribeToChannelState: (id: number) => createSubscribeToTagValue(props, {
        tagValuePath: ['rawInput'],
      })(LocalIOTags.rawAnalogInput(id))
    }),
  }),
  reduxForm({
    form: 'Calibration',
  })
)(CalibrationFormContainer)

