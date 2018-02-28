// @flow

import * as React from 'react'
import type {Feature} from '../Feature'
import MQTTSidebarSectionContainer from './MQTTSidebarSectionContainer'

export const FEATURE_ID = 'mqtt'
export const FEATURE_NAME = 'MQTT Control Panel'

const MQTTFeature: Feature = {
  sidebarSections: [
    MQTTSidebarSectionContainer,
  ],
  sidebarSectionsOrder: 400,
}

export default MQTTFeature

