// @flow

import * as React from 'react'
import type {Feature as BaseFeature} from 'redux-features'
import type {State, Action} from '../redux/types'
import typeof {Route} from 'react-router-dom'
import type {MappingProblem} from '../data-router/PluginConfigTypes'

type Routes = Array<React.Element<Route>> | React.Element<Route>

type SidebarSectionProps = {
  onSectionExpandedChange: (section: string, expanded: boolean) => any,
}
type SidebarSection = React.ComponentType<SidebarSectionProps>
type SidebarSections = SidebarSection | Array<SidebarSection>

export type Feature = BaseFeature<State, Action> & {
  +navbarRoutes?: Routes,
  +bodyRoutes?: Routes,
  +sidebarSections?: SidebarSections,
  +sidebarSectionsOrder?: number,
  +getMappingProblemURL?: {[pluginType: string]: (problem: MappingProblem) => ?string},
}

