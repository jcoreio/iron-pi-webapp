// @flow

import * as graphql from 'graphql'
import gql from 'graphql-tag'
import get from 'lodash.get'
import {setIn} from '@jcoreio/mutate'

import {MODE_AND_SYSTEM_VALUE_SELECTION} from './createSubscribeToChannelState'

function getAlias(selection: {alias?: ?graphql.NameNode}): ?string {
  return selection.alias ? selection.alias.value : null
}

/**
 * Creates a function that initiates a subscription to all Channel States
 */
export default function createSubscribeToChannelStates(
  props: Object,
  options?: {
    name?: string,
    channelsPath?: Iterable<any>,
    selection?: string,
    query?: graphql.DocumentNode,
    aliases?: {
      id?: ?string,
      state?: ?string,
    },
  } = {}
): () => Function {
  const channelsPath = options.channelsPath || ['LocalIOChannels']
  const aliases = options.aliases || (options.aliases = {})

  if (options.query) {
    const {definitions} = options.query
    for (let definition of definitions) {
      if (definition.kind !== 'OperationDefinition' || definition.operation !== 'query') continue
      let channelsNode: Object = definition
      for (let key of channelsPath) {
        if (!channelsNode || !channelsNode.selectionSet) break
        channelsNode = channelsNode.selectionSet.selections.find(selection => (getAlias(selection) || selection.name.value) === key)
      }
      if (!channelsNode || !channelsNode.selectionSet) break

      const {selectionSet: {selections: fields}} = channelsNode
      const idSelection = fields.find(selection => selection.name.value === 'id')
      const stateSelection = fields.find(selection => selection.name.value === 'state')
      if (!idSelection || !stateSelection) continue
      const aliases = options.aliases || (options.aliases = {})
      aliases.id = getAlias(idSelection)
      aliases.state = getAlias(stateSelection)
      options.selection = graphql.print(stateSelection.selectionSet)
    }
  }

  if (!aliases.id) aliases.id = 'id'
  if (!aliases.state) aliases.state = 'state'

  const selection = options.selection || MODE_AND_SYSTEM_VALUE_SELECTION
  const channelStatesSubscription = gql(`
    subscription LocalIOChannelStates {
      states: LocalIOChannelStates ${selection}
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
        const {states} = data
        if (!Array.isArray(states)) return
        let result = prev
        for (let state of states) {
          const Channels = get(prev, channelsPath)
          const index = Channels.findIndex(channel => channel[aliases.id] === state.id)
          if (index >= 0) result = setIn(result, [...channelsPath, index, aliases.state], state)
        }
        return result
      },
    })
  }
}
