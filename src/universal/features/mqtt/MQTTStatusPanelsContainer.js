// @flow

import * as React from 'react'
import {withRouter} from 'react-router-dom'
import type {Match, RouterHistory} from 'react-router-dom'
import {compose} from 'redux'
import gql from 'graphql-tag'
import {graphql} from 'react-apollo'
import {withTheme} from 'material-ui/styles'
import Typography from 'material-ui/Typography'
import type {Theme} from '../../theme'

import StatusPanel from '../../components/StatusPanel'
import Spinner from '../../components/Spinner'

import MQTTPluginStateSubscription from './MQTTPluginStateSubscription'
import type {MQTTConfig} from './MQTTConfigForm'
import MQTTStatusPanel from './MQTTStatusPanel'

export const MQTT_SECTION = 'mqtt'

type PropsFromTheme = {
  theme: Theme,
}

type PropsFromApollo = {
  data: {
    MQTTConfigs: ?Array<MQTTConfig>,
    loading: boolean,
  },
  subscribeToChannelStates: () => any,
}

type PropsFromRouter = {
  match: Match,
  history: RouterHistory,
}

type Props = PropsFromTheme & PropsFromApollo & PropsFromRouter

class MQTTStatusPanelsContainer extends React.Component<Props> {
  render(): ?React.Node {
    const {data, history} = this.props
    if (!data) return null
    if (data.loading) {
      return (
        <StatusPanel>
          <Typography variant="subheading">
            <Spinner /> Loading MQTT Status...
          </Typography>
        </StatusPanel>
      )
    }
    const {MQTTConfigs} = data
    if (!MQTTConfigs) return null
    return MQTTConfigs.map((config: MQTTConfig) => (
      <React.Fragment key={config.id}>
        <MQTTStatusPanel
          config={config}
          history={history}
        />
        <MQTTPluginStateSubscription id={config.id} />
      </React.Fragment>
    ))
  }
}

const configQuery = gql(`
fragment ChannelFields on MQTTChannelConfig {
  id
  mqttTag
  internalTag
}
query {
  MQTTConfigs {
    id
    name
    channelsFromMQTT {
      ...ChannelFields
    }
    channelsToMQTT {
      ...ChannelFields
    }
    state {
      id
      status
      connectedSince
      error
    }
  }
}
`)

export default compose(
  graphql(configQuery, {
    name: 'data',
    options: {
      errorPolicy: 'all',
    },
  }),
  withRouter,
  withTheme(),
)(MQTTStatusPanelsContainer)


