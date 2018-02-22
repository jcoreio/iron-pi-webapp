// @flow

import type {PubSubEngine} from 'graphql-subscriptions'
import type {DataPlugin, DataPluginMapping, CycleDoneEvent} from './PluginTypes'
import type {PluginInfo} from '../../universal/data-router/PluginConfigTypes'

import {TAG_VALUE} from '../graphql/subscription/constants'

export default class GraphQLDataPlugin implements DataPlugin {
  _pubsub: PubSubEngine

  constructor(pubsub: PubSubEngine) {
    this._pubsub = pubsub
  }

  pluginInfo(): PluginInfo {
    return {
      pluginType: 'graphql',
      pluginId: 'graphql',
      pluginName: 'graphql',
    }
  }

  ioMappings(): Array<DataPluginMapping> {
    return []
  }

  dispatchCycleDone(event: CycleDoneEvent) {
    const {changedTags, tagMap} = event
    for (let tag of changedTags) {
      const {v} = tagMap[tag] || {v: null}
      this._pubsub.publish(`${TAG_VALUE}/${tag}`, {TagValue: v})
    }
  }
}

