// @flow

import * as graphql from 'graphql'
import gql from 'graphql-tag'
import get from 'lodash.get'
import {setIn} from '@jcoreio/mutate'

import {MODE_AND_SYSTEM_VALUE_SELECTION} from './createSubscribeToChannelState'

/**
 * Creates a function that initiates a subscription to all Channel States
 */
export default function createSubscribeToChannelStates(
  props: Object,
  options?: {
    name?: string,
    channelsPath?: Iterable<any>,
    selection?: string,
    query?: DocumentNode,
    aliases?: {
      id?: string,
      state?: string,
    },
  } = {}
): () => Function {
  const channelsPath = options.channelsPath || ['LocalIOChannels']
  const aliases = options.aliases || (options.aliases = {})

  if (options.query) {
    const {definitions} = options.query
    for (let definition of definitions) {
      if (definition.kind !== 'OperationDefinition' || definition.operation !== 'query') continue
      let channelsNode = definition
      for (let key of channelsPath) {
        if (!channelsNode || !channelsNode.selectionSet) break
        channelsNode = channelsNode.selectionSet.selections.find(selection => (selection.alias || selection.name.value) === key)
      }
      if (!channelsNode || !channelsNode.selectionSet) break
      options.name = channelsNode.alias

      if (!channelsNode.selectionSet) continue
      const {selectionSet: {selections: fields}} = channelsNode
      const idSelection = fields.find(selection => selection.name.value === 'id')
      const stateSelection = fields.find(selection => selection.name.value === 'state')
      if (!idSelection || !stateSelection) continue
      const aliases = options.aliases || (options.aliases = {})
      aliases.id = idSelection.alias
      aliases.state = stateSelection.alias
      options.selection = graphql.print(stateSelection.selectionSet)
    }
  }

  if (!aliases.id) aliases.id = 'id'
  if (!aliases.state) aliases.state = 'state'

  const selection = options.selection || MODE_AND_SYSTEM_VALUE_SELECTION
  const channelStatesSubscription = gql(`
    subscription LocalIOChannelStates {
      LocalIOChannelStates {
        id
        state ${selection}
      }
    }  
  `)

  return function subscribeToChannelStates(): Function {
    const name = options.name || 'data'
    return props[name].subscribeToMore({
      document: channelStatesSubscription,
      updateQuery: (prev: Object, update: {subscriptionData: {errors?: Array<Error>}}) => {
        const {subscriptionData: {[name]: data, errors}} = (update: any)
        if (errors) {
          errors.forEach(error => console.error(error.message)) // eslint-disable-line no-console
          return prev
        }
        if (!data) return prev
        const {LocalIOChannelStates} = data
        if (!Array.isArray(LocalIOChannelStates)) return
        let result = prev
        for (let {id, state} of LocalIOChannelStates) {
          const Channels = get(prev, channelsPath)
          const index = Channels.findIndex(channel => channel[aliases.id] === id)
          if (index >= 0) result = setIn(result, [...channelsPath, index, aliases.state], state)
        }
        return result
      },
    })
  }
}
