// @flow

import * as graphql from 'graphql'
import type {Context} from '../../../graphql/Context'
import type LocalIODataPlugin from '../../LocalIODataPlugin'

export default function setLocalChannelRemoteControlValue({plugin}: {
  plugin: LocalIODataPlugin,
}): graphql.GraphQLFieldConfig<any, Context> {
  return {
    type: graphql.GraphQLBoolean,
    args: {
      id: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLInt),
        description: 'The id of the loca channel to set the remote control value of',
      },
      controlValue: {
        type: graphql.GraphQLInt,
      },
    },
    resolve: (doc: any, args: {id: number, controlValue: ?number}, context: Context): boolean => {
      const {id, controlValue} = args
      plugin.setRemoteControlValue(id, controlValue == null ? null : Boolean(controlValue))
      return true
    },
  }
}

