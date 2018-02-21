// @flow

import * as graphql from 'graphql'
import gql from 'graphql-tag'
import {setIn} from '@jcoreio/mutate'

export const MODE_AND_SYSTEM_VALUE_SELECTION = `{
  mode
  systemValue 
}`

export const ALL_FIELDS_SELECTION = `{
  mode
  systemValue
  ... on InputChannelState {
    rawInput
  }
  ... on DigitalChannelState {
    reversePolarity
  }
  ... on DigitalOutputState {
    safeState
    controlValue
    rawOutput
  }
}`

function getAlias(selection: {alias?: ?graphql.NameNode}): ?string {
  return selection.alias ? selection.alias.value : null
}

/**
 * Creates a function that initiates a subscription to a Channel State
 */
export default function createSubscribeToChannelState(
  props: Object,
  options?: {
    name?: string,
    channelPath?: Iterable<any>,
    selection?: string,
    query?: graphql.DocumentNode,
    aliases?: {
      state?: ?string,
    },
  } = {}
): (id: number) => Function {
  const channelPath = options.channelPath || ['LocalIOChannel']
  const aliases = options.aliases || (options.aliases = {})

  if (options.query) {
    const {definitions} = options.query
    for (let definition of definitions) {
      if (definition.kind !== 'OperationDefinition' || definition.operation !== 'query') continue
      let channelNode: Object = definition
      for (let key of channelPath) {
        if (!channelNode || !channelNode.selectionSet) break
        channelNode = channelNode.selectionSet.selections.find(selection => (getAlias(selection) || selection.name.value) === key)
      }
      if (!channelNode || !channelNode.selectionSet) break

      const {selectionSet: {selections: fields}} = channelNode
      const stateSelection = fields.find(selection => selection.name.value === 'state')
      if (!stateSelection) continue
      const aliases = options.aliases || (options.aliases = {})
      aliases.state = getAlias(stateSelection)
      options.selection = graphql.print(stateSelection.selectionSet)
    }
  }

  if (!aliases.state) aliases.state = 'state'

  const selection = options.selection || MODE_AND_SYSTEM_VALUE_SELECTION
  const channelStateSubscription = gql(`
    subscription LocalIOChannelState($id: Int!) {
      LocalIOChannelState(id: $id) ${selection}
    }  
  `)

  return function subscribeToChannelState(id: number): Function {
    const name = options.name || 'data'
    return props[name].subscribeToMore({
      document: channelStateSubscription,
      variables: {
        id,
      },
      updateQuery: (prev: Object, update: {subscriptionData: {errors?: Array<Error>}}) => {
        const {subscriptionData: {[name]: data, errors}} = (update: any)
        if (errors) {
          errors.forEach(error => console.error(error.message)) // eslint-disable-line no-console
          return prev
        }
        if (!data) return prev
        const {LocalIOChannelState: newState} = data
        if (!newState) return prev
        return setIn(prev, [...channelPath, aliases.state], newState)
      },
    })
  }
}

