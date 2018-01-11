// @flow

import type {Store} from '../redux/types'
import {addFeature} from 'redux-features'
import channelFormFeature from './ChannelForm/channelFormFeature'

export default function addFeatures(store: Store) {
  store.dispatch(addFeature('channelForm', channelFormFeature))
}

