// @flow

import type {ChannelState} from '../../../universal/types/Channel'

interface PubSub {
  publish: (eventName: string, payload: Object) => any,
}

export default function publishChannelStates(pubsub: PubSub, channelStates: Array<ChannelState>) {
  pubsub.publish('ChannelStates', {ChannelStates: channelStates})
  for (let state of channelStates) {
    pubsub.publish(`ChannelState/${state.channelId}`, {ChannelState: state})
  }
}

