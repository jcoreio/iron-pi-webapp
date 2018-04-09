// @flow

import * as React from 'react'
import {Route, NavLink} from 'react-router-dom'

import type {Feature} from '../Feature'
import {SECURITY} from './routePaths'
import featureLoader from '../../components/featureLoader'
import Title from '../../components/Navbar/Title'
import SidebarSectionHeader from '../../components/Sidebar/SidebarSectionHeader'

export const FEATURE_ID = 'securityView'
export const FEATURE_NAME = 'Security View'

const SecurityView = featureLoader({
  featureId: FEATURE_ID,
  featureName: FEATURE_NAME,
  getComponent: feature => (feature: any).SecurityView,
})

const SecurityViewLink = () => (
  <SidebarSectionHeader key={SECURITY} component={NavLink} to={SECURITY} title="Security" />
)

const SecurityViewFeature: Feature = {
  navbarRoutes: [
    <Route
      key={SECURITY}
      path={SECURITY}
      render={() => (
        <Title>
          Security
        </Title>
      )}
    />,
  ],
  bodyRoutes: [
    <Route
      key={SECURITY}
      path={SECURITY}
      component={SecurityView}
    />,
  ],
  sidebarSections: [SecurityViewLink],
  sidebarSectionsOrder: 900,
  load: async () => {
    return {
      ...SecurityViewFeature,
      SecurityView: (await import('./SecurityView')).default,
    }
  }
}

export default SecurityViewFeature

