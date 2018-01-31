// @flow

import * as React from 'react'
import {Route, Link} from 'react-router-dom'
import type {ContextRouter} from 'react-router-dom'
import featureLoader from '../../components/featureLoader'
import {channelForm, calibrationForm, CALIBRATION} from '../../react-router/routePaths'
import Title from '../../components/Navbar/Title'
import ChevronRight from '../../components/Navbar/ChevronRight'
import Drilldown from 'react-router-drilldown/lib/withTransitionContext'

const ChannelFormContainer = featureLoader({
  featureId: 'channelForm',
  featureName: 'Channel Form',
  getComponent: feature => (feature: any).ChannelFormContainer,
})

const CalibrationFormContainer = featureLoader({
  featureId: 'calibrationForm',
  featureName: 'Calibration Form',
  getComponent: feature => (feature: any).CalibrationFormContainer,
})

const channelFormFeature = {
  navbarRoutes: [
    <Route
      key={channelForm((':physicalChannelId': any))}
      path={channelForm((':physicalChannelId': any))}
      render={({match}) => (
        <Title>
          Local I/O
          <ChevronRight />
          <Link to={match.url} data-test-name="channelFormLink">
            Channel {match.params.physicalChannelId}
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
      key={channelForm((':physicalChannelId': any))}
      path={channelForm((':physicalChannelId': any))}
      render={({match: {params: {physicalChannelId}}}) => (
        <Drilldown animateHeight={false}>
          <Route
            path={channelForm((':physicalChannelId': any))}
            exact
            render={() => <ChannelFormContainer physicalChannelId={parseInt(physicalChannelId)} />}
          />
          <Route
            path={calibrationForm((':physicalChannelId': any))}
            render={(props: ContextRouter) => <CalibrationFormContainer physicalChannelId={parseInt(physicalChannelId)} {...props} />}
          />
        </Drilldown>
      )}
    />,
  ],
  load: async () => {
    return {
      ...channelFormFeature,
      ChannelFormContainer: (await import('./ChannelFormContainer')).default,
    }
  }
}

export default channelFormFeature

