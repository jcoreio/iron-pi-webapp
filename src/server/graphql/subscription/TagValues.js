// @flow

import type {GraphQLFieldConfig} from 'graphql'
import * as graphql from 'graphql'
import type {Context} from '../Context'
import TaggedTimeValuePairType from '../types/TaggedTimeValuePair'
import type {TimeValuePair} from '../../data-router/PluginTypes'
import {TAG_VALUES} from './constants'

export default function createTagValues(): GraphQLFieldConfig<any, Context> {
  return {
    type: new graphql.GraphQLNonNull(TaggedTimeValuePairType),
    description: 'Subscribes to the value of all tags',
    subscribe(doc: any, args: Object, context: Context): AsyncIterator<{tag: string} & TimeValuePair> {
      const {userId, pubsub} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to subscribe to tag values')
      return pubsub.asyncIterator(TAG_VALUES)
    }
  }
}

