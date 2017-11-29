// @flow

import * as React from 'react'
import {featureLoader as _featureLoader} from 'react-redux-features'
import {Alert} from '@jcoreio/rubix'
import type {Feature, FeatureState} from 'redux-features'
import Spinner from './Spinner'

type Options = {
  featureId: string,
  featureName: string,
  getComponent: (feature: Feature<any, any>) => any,
}

/**
 * A wrapper for featureLoader that provides rubix-styled alerts when the feature is loading
 * or failed to load.
 */
export default function featureLoader<P: Object>(options: Options): (props: P) => React.Element<any> {
  const {
    featureId,
    featureName,
    getComponent,
  } = options

  const FeatureComponentOrStatus = (
    {featureState, feature, props}: {featureState: FeatureState, feature: ?Feature<any, any>, props: Object}
  ): React.Element<any> => {
    const Comp = getComponent && feature ? getComponent(feature) : null

    if (featureState instanceof Error) {
      return (
        <Alert danger style={{margin: 15}}>
          Failed to load {featureName}: {featureState.message}
        </Alert>
      )
    } else if (!Comp) {
      return (
        <Alert info style={{margin: 15}}>
          <Spinner /> Loading {featureName}...
        </Alert>
      )
    }
    return <Comp {...props} />
  }

  return _featureLoader({
    featureId,
    render: FeatureComponentOrStatus,
  })
}
