// @flow

import type {PubSubEngine} from 'graphql-subscriptions'
import type {DataPlugin, CycleDoneEvent} from './PluginTypes'
import type {PluginInfo} from '../../universal/data-router/PluginConfigTypes'
import type {DataPluginMapping} from '../../universal/types/PluginTypes'

import {TAG_VALUE, TAG_STATE} from '../graphql/subscription/constants'

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
      const state = tagMap[tag]
      const {v} = state || {v: null}
      this._pubsub.publish(`${TAG_VALUE}/${tag}`, {TagValue: v})
      this._pubsub.publish(`${TAG_STATE}/${tag}`, {
        TagState: state
          ? {...state, tag}
          : {tag, t: Date.now(), v: null},
      })
    }
  }
}

