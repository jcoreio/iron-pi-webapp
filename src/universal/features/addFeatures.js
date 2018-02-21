// @flow

import type {Store} from '../redux/types'
import {addFeature} from 'redux-features'
import LocalIOFeature, {FEATURE_ID as LOCAL_IO_FEATURE_ID} from './localio/LocalIOFeature'
import calibrationFormFeature from './CalibrationForm/calibrationFormFeature'

export default function addFeatures(store: Store) {
  store.dispatch(addFeature(LOCAL_IO_FEATURE_ID, LocalIOFeature))
  store.dispatch(addFeature('calibrationForm', calibrationFormFeature))
}

