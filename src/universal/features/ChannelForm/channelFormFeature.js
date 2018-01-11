// @flow

import * as React from 'react'
import {Route} from 'react-router-dom'
import featureLoader from '../../components/featureLoader'
import {channelForm} from '../../react-router/routePaths'
import Title from '../../components/Navbar/Title'

const ChannelFormContainer = featureLoader({
  featureId: 'channelForm',
  featureName: 'Channel Form',
  getComponent: feature => (feature: any).ChannelFormContainer,
})

const channelFormFeature = {
  navbarRoutes: [
    <Route
      key={channelForm((':id': any))}
      path={channelForm((':id': any))}
      exact
      render={() => <Title>Edit Channel</Title>}
    />,
  ],
  bodyRoutes: [
    <Route
      key={channelForm((':id': any))}
      path={channelForm((':id': any))}
      exact
      render={({match: {params: {id}}}) => <ChannelFormContainer channelId={parseInt(id)} />}
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

