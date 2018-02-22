// @flow

import * as graphql from 'graphql'
import type {Context} from '../../../graphql/Context'
import type LocalIODataPlugin from '../../LocalIODataPlugin'

export default function updateRawOutputs({plugin}: {
  plugin: LocalIODataPlugin,
}): graphql.GraphQLFieldConfig<any, Context> {
  return {
    type: graphql.GraphQLBoolean,
    args: {
    },
    resolve: (doc: any, args: any, context: Context): ?boolean => {
      const {userId, scopes} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to update LocalIOChannels')
      if (!scopes.has('localio:test:setRawInputs')) {
        throw new graphql.GraphQLError('You do not have permission to update raw outputs')
      }
      plugin._updateRawOutputsForTest()
    },
  }
}

