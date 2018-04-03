// @flow

import type {Store} from '../redux/types'
import {addFeature} from 'redux-features'
import LocalIOFeature, {FEATURE_ID as LOCAL_IO_FEATURE_ID} from './localio/LocalIOFeature'
import MQTTFeature, {FEATURE_ID as MQTT_FEATURE_ID} from './mqtt/MQTTFeature'
import NetworkSettingsFeature, {FEATURE_ID as NETWORK_SETTINGS_FEATURE_ID} from './networkSettings/NetworkSettingsFeature'

export default function addFeatures(store: Store) {
  store.dispatch(addFeature(LOCAL_IO_FEATURE_ID, LocalIOFeature))
  store.dispatch(addFeature(MQTT_FEATURE_ID, MQTTFeature))
  store.dispatch(addFeature(NETWORK_SETTINGS_FEATURE_ID, NetworkSettingsFeature))
}

