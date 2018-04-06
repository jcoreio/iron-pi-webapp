// @flow

import * as React from 'react'
import {Link} from 'react-router-dom'
import type {Match, RouterHistory} from 'react-router-dom'
import StatusPanel from '../../components/StatusPanel'
import {ViewPanelBody} from '../../components/ViewPanel'
import {StatusPanelTitle} from '../../components/StatusPanel'
import MQTTConfigState from './MQTTConfigState'
import MQTTChannelConfigsTable from './MQTTChannelConfigsTable'
import RealtimeMQTTChannelRow from './RealtimeMQTTChannelRow'
import type {MQTTConfig} from './MQTTConfigForm'
import {mqttConfigForm} from './routePaths'

export type Props = {
  config: MQTTConfig,
  history: RouterHistory,
}

const MQTTStatusPanel = ({config, history}: Props): React.Node => {
  const {id} = config
  const match: Match = {
    isExact: true,
    params: {
      id: String(id),
    },
    path: mqttConfigForm((':id': any)),
    url: mqttConfigForm(id),
  }
  return (
    <StatusPanel>
      <StatusPanelTitle component={Link} to={mqttConfigForm(id)}>
        MQTT: {config.name}
      </StatusPanelTitle>
      <ViewPanelBody noVerticalPadding>
        <MQTTConfigState state={config.state} />
      </ViewPanelBody>
      <MQTTChannelConfigsTable
        channels={config.channelsToMQTT}
        direction="TO_MQTT"
        showEditButtons={false}
        ChannelRow={RealtimeMQTTChannelRow}
        match={match}
        history={history}
      />
      <MQTTChannelConfigsTable
        channels={config.channelsFromMQTT}
        direction="FROM_MQTT"
        showEditButtons={false}
        ChannelRow={RealtimeMQTTChannelRow}
        match={match}
        history={history}
      />
    </StatusPanel>
  )
}

export default MQTTStatusPanel

