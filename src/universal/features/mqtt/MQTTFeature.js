// @flow

import * as React from 'react'
import {Route, Link} from 'react-router-dom'
import type {Match} from 'react-router-dom'
import Drilldown from 'react-router-drilldown/lib/withTransitionContext'

import type {Feature} from '../Feature'
import MQTTSidebarSectionContainer from './MQTTSidebarSectionContainer'
import {mqttConfigForm} from './routePaths'
import featureLoader from '../../components/featureLoader'
import Title from '../../components/Navbar/Title'
import ChevronRight from '../../components/Navbar/ChevronRight'

export const FEATURE_ID = 'mqtt'
export const FEATURE_NAME = 'MQTT Control Panel'

const MQTTConfigFormContainer = featureLoader({
  featureId: FEATURE_ID,
  featureName: FEATURE_NAME,
  getComponent: feature => (feature: any).MQTTConfigFormContainer,
})

const MQTTFeature: Feature = {
  navbarRoutes: [
    <Route
      key={mqttConfigForm((':id': any))}
      path={mqttConfigForm((':id': any))}
      render={({match}) => (
        <Title>
          MQTT
          <ChevronRight />
          <Link to={match.url} data-test-name="mqttConfigFormLink">
            {match.params.id === 'create' ? 'Create Config' : `Config ${match.params.id || '?'}`}
          </Link>
        </Title>
      )}
    />,
  ],
  bodyRoutes: [
    <Route
      key={mqttConfigForm(('create': any))}
      path={mqttConfigForm(('create': any))}
      render={({match}: {match: Match}): React.Node => {
        return (
          <Drilldown animateHeight={false}>
            <Route
              path={mqttConfigForm(('create': any))}
              exact
              render={({history}) => <MQTTConfigFormContainer history={history} />}
            />
          </Drilldown>
        )
      }}
    />,
    <Route
      key={mqttConfigForm((':id': any))}
      path={mqttConfigForm((':id': any))}
      render={({match}: {match: Match}): React.Node => {
        const id = parseInt(match.params.id) - 1
        return (
          <Drilldown animateHeight={false}>
            <Route
              path={mqttConfigForm((':id': any))}
              exact
              render={({history}) => <MQTTConfigFormContainer id={id} history={history} />}
            />
          </Drilldown>
        )
      }}
    />,
  ],
  sidebarSections: [
    MQTTSidebarSectionContainer,
  ],
  sidebarSectionsOrder: 400,
  load: async () => {
    return {
      ...MQTTFeature,
      MQTTConfigFormContainer: (await import('./MQTTConfigFormContainer')).default,
    }
  }
}

export default MQTTFeature

