// @flow

import * as React from 'react'
import TagStateSubscription from '../../apollo/TagStateSubscription'
import * as MQTTTags from '../../mqtt/MQTTTags'

import type {MQTTConfig} from './MQTTConfigForm'

export type Props = {
  config: MQTTConfig,
}

const MQTTChannelStateSubscriptions = ({config}: Props): React.Node => {
  const {id, channelsToMQTT, channelsFromMQTT} = config
  const tags: Array<string> = []
  for (let {internalTag, mqttTag} of (channelsToMQTT || [])) {
    tags.push(internalTag)
    tags.push(MQTTTags.toMQTTValue(id, mqttTag))
  }
  for (let {internalTag, mqttTag} of (channelsFromMQTT || [])) {
    tags.push(internalTag)
    tags.push(MQTTTags.fromMQTTValue(id, mqttTag))
  }
  return (
    <React.Fragment>
      {tags.map(tag => <TagStateSubscription key={tag} tag={tag} />)}
    </React.Fragment>
  )
}

export default MQTTChannelStateSubscriptions

