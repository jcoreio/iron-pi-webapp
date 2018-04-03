// @flow

import * as React from 'react'
import {Route, NavLink} from 'react-router-dom'

import type {Feature} from '../Feature'
import {NETWORK_SETTINGS} from './routePaths'
import featureLoader from '../../components/featureLoader'
import Title from '../../components/Navbar/Title'
import SidebarSectionHeader from '../../components/Sidebar/SidebarSectionHeader'

export const FEATURE_ID = 'networkSettings'
export const FEATURE_NAME = 'Network Settings'

const NetworkSettingsFormContainer = featureLoader({
  featureId: FEATURE_ID,
  featureName: FEATURE_NAME,
  getComponent: feature => (feature: any).NetworkSettingsFormContainer,
})

const NetworkSettingsFeature: Feature = {
  navbarRoutes: [
    <Route
      key={NETWORK_SETTINGS}
      path={NETWORK_SETTINGS}
      render={() => (
        <Title>
          IP Address
        </Title>
      )}
    />,
  ],
  bodyRoutes: [
    <Route
      key={NETWORK_SETTINGS}
      path={NETWORK_SETTINGS}
      component={NetworkSettingsFormContainer}
    />,
  ],
  sidebarSections: [
    <SidebarSectionHeader key={NETWORK_SETTINGS} component={NavLink} to={NETWORK_SETTINGS} title="IP Address" />,
  ],
  sidebarSectionsOrder: 800,
  load: async () => {
    return {
      ...NetworkSettingsFeature,
      NetworkSettingsFormContainer: (await import('./NetworkSettingsFormContainer')).default,
    }
  }
}

export default NetworkSettingsFeature

