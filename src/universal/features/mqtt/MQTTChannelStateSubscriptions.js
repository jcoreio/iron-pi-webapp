// @flow

import * as React from 'react'
import TagStateSubscription from '../../apollo/TagStateSubscription'
import * as MQTTTags from '../../mqtt/MQTTTags'

import type {MQTTConfig} from './MQTTConfigForm'

export type Props = {
  config: MQTTConfig,
}

const MQTTChannelStateSubscriptions = ({config: {channelsToMQTT, channelsFromMQTT}}: Props): React.Node => {
  const tags: Array<string> = []
  for (let channels of [channelsToMQTT, channelsFromMQTT]) {
    if (!channels) continue
    for (let {internalTag, mqttTag} of channels) {
      tags.push(internalTag)
      tags.push(MQTTTags.mqttValue(mqttTag))
    }
  }
  return (
    <React.Fragment>
      {tags.map(tag => <TagStateSubscription key={tag} tag={tag} />)}
    </React.Fragment>
  )
}

export default MQTTChannelStateSubscriptions

