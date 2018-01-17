// @flow

import type {Store} from '../redux/types'
import {addFeature} from 'redux-features'
import channelFormFeature from './ChannelForm/channelFormFeature'
import calibrationFormFeature from './CalibrationForm/calibrationFormFeature'

export default function addFeatures(store: Store) {
  store.dispatch(addFeature('channelForm', channelFormFeature))
  store.dispatch(addFeature('calibrationForm', calibrationFormFeature))
}

