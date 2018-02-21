// @flow

import * as React from 'react'
import {Route, Link} from 'react-router-dom'
import type {ContextRouter, Match} from 'react-router-dom'
import Drilldown from 'react-router-drilldown/lib/withTransitionContext'
import type {Feature} from '../Feature'
import featureLoader from '../../components/featureLoader'
import {channelForm, calibrationForm, CALIBRATION} from './routePaths'
import Title from '../../components/Navbar/Title'
import ChevronRight from '../../components/Navbar/ChevronRight'
import LocalIOSidebarSectionContainer from './LocalIOSidebarSectionContainer'

export const FEATURE_ID = 'localio'

const ChannelFormContainer = featureLoader({
  featureId: FEATURE_ID,
  featureName: 'Local I/O',
  getComponent: feature => (feature: any).ChannelFormContainer,
})

const CalibrationFormContainer = featureLoader({
  featureId: 'calibrationForm',
  featureName: 'Calibration Form',
  getComponent: feature => (feature: any).CalibrationFormContainer,
})

const LocalIOFeature: Feature = {
  navbarRoutes: [
    <Route
      key={channelForm((':id': any))}
      path={channelForm((':id': any))}
      render={({match}) => (
        <Title>
          Local I/O
          <ChevronRight />
          <Link to={match.url} data-test-name="channelFormLink">
            Channel {match.params.id}
          </Link>
          <Route
            path={`${match.url}/${CALIBRATION}`}
            render={() => (
              <React.Fragment>
                <ChevronRight />
                Calibration
              </React.Fragment>
            )}
          />
        </Title>
      )}
    />,
  ],
  bodyRoutes: [
    <Route
      key={channelForm((':id': any))}
      path={channelForm((':id': any))}
      render={({match}: {match: Match}): React.Node => {
        const id = parseInt(match.params.id) - 1
        return (
          <Drilldown animateHeight={false}>
            <Route
              path={channelForm((':id': any))}
              exact
              render={() => <ChannelFormContainer id={id} />}
            />
            <Route
              path={calibrationForm((':id': any))}
              render={(props: ContextRouter) => <CalibrationFormContainer id={id} {...props} />}
            />
          </Drilldown>
        )
      }}
    />,
  ],
  sidebarSections: [
    LocalIOSidebarSectionContainer,
  ],
  sidebarSectionsOrder: 500,
  load: async () => {
    return {
      ...LocalIOFeature,
      ChannelFormContainer: (await import('./ChannelFormContainer')).default,
    }
  }
}

export default LocalIOFeature

