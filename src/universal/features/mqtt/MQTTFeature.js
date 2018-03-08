// @flow

import * as React from 'react'
import {Route, Link} from 'react-router-dom'
import type {Match, RouterHistory} from 'react-router-dom'
import Drilldown from 'react-router-drilldown/lib/withTransitionContext'

import type {Feature} from '../Feature'
import MQTTSidebarSectionContainer from './MQTTSidebarSectionContainer'
import {mqttConfigForm, mqttChannelConfigForm} from './routePaths'
import featureLoader from '../../components/featureLoader'
import Title from '../../components/Navbar/Title'
import ChevronRight from '../../components/Navbar/ChevronRight'
import type {MappingProblem} from '../../data-router/PluginConfigTypes'

export const FEATURE_ID = 'mqtt'
export const FEATURE_NAME = 'MQTT Control Panel'

const MQTTConfigFormContainer = featureLoader({
  featureId: FEATURE_ID,
  featureName: FEATURE_NAME,
  getComponent: feature => (feature: any).MQTTConfigFormContainer,
})

const MQTTChannelConfigFormContainer = featureLoader({
  featureId: FEATURE_ID,
  featureName: FEATURE_NAME,
  getComponent: feature => (feature: any).MQTTChannelConfigFormContainer,
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
          <Route
            path={mqttChannelConfigForm(match.url, (':id': any))}
            render={({match}) => (
              <React.Fragment>
                <ChevronRight />
                {match.params.id === 'create' ? 'Create Channel' : 'Edit Channel'}
              </React.Fragment>
            )}
          />
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
              render={({match, history}) => <MQTTConfigFormContainer match={match} history={history} />}
            />
          </Drilldown>
        )
      }}
    />,
    <Route
      key={mqttConfigForm((':id': any))}
      path={mqttConfigForm((':id': any))}
      render={({match}: {match: Match}): React.Node => {
        const configId = parseInt(match.params.id)
        return (
          <Drilldown animateHeight={false}>
            <Route
              path={mqttConfigForm((':id': any))}
              exact
              render={({match, history}) => <MQTTConfigFormContainer id={configId} match={match} history={history} />}
            />
            <Route
              path={mqttChannelConfigForm(mqttConfigForm((':configId': any)), (':id': any))}
              render={({match, history}: {match: Match, history: RouterHistory}) => {
                if (match.params.id === 'create') {
                  return (
                    <Route
                      path={`${match.url}/:direction`}
                      render={({match, history}: { match: Match, history: RouterHistory }) => (
                        <MQTTChannelConfigFormContainer
                          direction={match.params.direction === 'to' ? 'TO_MQTT' : 'FROM_MQTT'}
                          configId={configId}
                          match={match}
                          history={history}
                        />
                      )}
                    />
                  )
                }
                const id = parseInt(match.params.id)
                return (
                  <MQTTChannelConfigFormContainer
                    id={id}
                    configId={configId}
                    match={match}
                    history={history}
                  />
                )
              }}
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
  getMappingProblemURL: {
    mqtt: ({mappingLocation: {pluginId, channelId}}: MappingProblem): ?string => {
      return mqttChannelConfigForm(mqttConfigForm((pluginId: any)), (channelId: any))
    }
  },
  load: async () => {
    return {
      ...MQTTFeature,
      MQTTConfigFormContainer: (await import('./MQTTConfigFormContainer')).default,
      MQTTChannelConfigFormContainer: (await import('./MQTTChannelConfigFormContainer')).default,
    }
  }
}

export default MQTTFeature

