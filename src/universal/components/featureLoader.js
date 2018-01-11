// @flow

import * as React from 'react'
import {featureLoader as _featureLoader} from 'react-redux-features'
import type {Feature, FeatureState} from 'redux-features'
import Spinner from './Spinner'
import ErrorAlert from './ErrorAlert'

type Options = {
  featureId: string,
  featureName: string,
  getComponent: (feature: Feature<any, any>) => React.ComponentType<any>,
}

/**
 * A wrapper for featureLoader that provides rubix-styled alerts when the feature is loading
 * or failed to load.
 */
export default function featureLoader<P: Object>(options: Options): React.ComponentType<P> {
  const {
    featureId,
    featureName,
    getComponent,
  } = options

  const FeatureComponentOrStatus = (
    {featureState, feature, props}: {featureState: FeatureState, feature: ?Feature<any, any>, props: P}
  ): React.Element<any> => {
    const Comp = getComponent && feature ? getComponent(feature) : null

    if (featureState instanceof Error) {
      return (
        <ErrorAlert style={{margin: '15px auto', textAlign: 'center'}}>
          Failed to load {featureName}: {featureState.message}
        </ErrorAlert>
      )
    } else if (!Comp) {
      return (
        <div style={{margin: '15px auto', textAlign: 'center'}}>
          <Spinner /> Loading {featureName}...
        </div>
      )
    }
    return <Comp {...props} />
  }

  return _featureLoader({
    featureId,
    render: FeatureComponentOrStatus,
  })
}
