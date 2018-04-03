// @flow

import * as React from 'react'
import type {Feature as BaseFeature} from 'redux-features'
import type {State, Action} from '../redux/types'
import typeof {Route} from 'react-router-dom'
import type {MappingProblem} from '../data-router/PluginConfigTypes'

type Routes = Array<React.Element<Route>> | React.Element<Route>

export type Feature = BaseFeature<State, Action> & {
  +navbarRoutes?: Routes,
  +bodyRoutes?: Routes,
  +sidebarSections?: any,
  +sidebarSectionsOrder?: number,
  +getMappingProblemURL?: {[pluginType: string]: (problem: MappingProblem) => ?string},
}

