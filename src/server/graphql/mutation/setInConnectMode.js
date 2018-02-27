// @flow

import * as graphql from 'graphql'
import type {GraphQLContext} from '../Context'

function createSetInConnectMode(): graphql.GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: graphql.GraphQLBoolean,
    args: {
      inConnectMode: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean)
      },
    },
    resolve: (obj: any, {inConnectMode}: {inConnectMode: boolean}, {connectModeHandler}: GraphQLContext) => {
      connectModeHandler.inConnectMode = inConnectMode
    }
  }
}
module.exports = createSetInConnectMode
