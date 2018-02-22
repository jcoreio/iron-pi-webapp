// @flow

import * as graphql from 'graphql'
import type {Context} from '../../../graphql/Context'
import type LocalIODataPlugin from '../../LocalIODataPlugin'

export default function setLocalChannelRawInput({plugin}: {
  plugin: LocalIODataPlugin,
}): graphql.GraphQLFieldConfig<any, Context> {
  return {
    type: graphql.GraphQLBoolean,
    args: {
      id: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
        description: 'The id of the local channel to set the raw input of',
      },
      rawAnalogInput: {
        type: graphql.GraphQLFloat,
      },
      rawDigitalInput: {
        type: graphql.GraphQLBoolean,
      },
    },
    resolve: (doc: any, args: {id: number, rawAnalogInput?: ?number, rawDigitalInput?: ?boolean}, context: Context): ?boolean => {
      const {userId, scopes} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to update LocalIOChannels')
      if (!scopes.has('localio:test:setRawInputs')) {
        throw new graphql.GraphQLError('You do not have permission to set raw inputs')
      }
      plugin._setRawInputValues(args)
    },
  }
}

