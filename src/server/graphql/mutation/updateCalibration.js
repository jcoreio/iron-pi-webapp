// @flow

import type {GraphQLFieldConfig, GraphQLOutputType} from 'graphql'
import * as graphql from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import type {Context} from '../Context'
import Channel from '../../models/Channel'
import type {Calibration} from '../../../universal/types/Channel'

type Options = {
  types: {[name: string]: GraphQLOutputType},
}

export default function updateCalibration({types}: Options): GraphQLFieldConfig<any, Context> {
  return {
    type: types[Channel.name],
    args: {
      id: {
        type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      },
      calibration: {
        type: new graphql.GraphQLNonNull(GraphQLJSON),
      },
    },
    resolve: async (doc: any, {id, calibration}: {id: number, calibration: Calibration}, context: Context): Promise<any> => {
      const {userId} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to update Channels')

      const channel = await Channel.findOne({where: {id}})
      if (!channel) throw new graphql.GraphQLError('Failed to find Channel to update')
      await channel.update({config: {...channel.config, calibration}}, {individualHooks: true})
      const result = await Channel.findOne({where: {id}})
      if (!result) throw new graphql.GraphQLError('Failed to find updated Channel')
      return result.get({plain: true, raw: true})
    },
  }
}

