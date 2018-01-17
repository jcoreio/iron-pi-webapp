// @flow

import * as React from 'react'
import {featureContent as _featureContent} from 'react-redux-features'
import type {Feature, Features} from 'redux-features'
import type {Action, State} from '../redux/types'

type Options = {
  sortFeatures?: (features: Features<State, Action>) => Array<Feature<State, Action>>,
  getContent: (feature: Feature<State, Action>) => any,
}

/**
 * A wrapper for featureLoader that provides rubix-styled alerts when the feature is loading
 * or failed to load.
 */
export default function featureContent<P: Object>(options: Options): React.ComponentType<P> {
  const {sortFeatures, getContent} = options

  return _featureContent({
    getFeatures: (state: State): Features<State, Action> => state.features,
    sortFeatures,
    getContent,
  })
}
