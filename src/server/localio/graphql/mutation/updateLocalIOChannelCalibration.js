// @flow

import * as graphql from 'graphql'
import LocalIOChannel from '../../models/LocalIOChannel'
import JSONType from 'graphql-type-json'
import type {Context} from '../../../graphql/Context'
import type {Calibration} from '../../../../universal/localio/LocalIOChannel'

export default function updateLocalIOChannelCalibration({types}: {
  types: {[name: string]: graphql.GraphQLOutputType},
}): graphql.GraphQLFieldConfig<any, Context> {
  return {
    type: types[LocalIOChannel.options.name.singular],
    args: {
      id: {
        type: graphql.GraphQLInt,
        description: 'The id of the channel to update',
      },
      where: {
        type: JSONType,
        description: 'The sequelize where options',
      },
      calibration: {
        type: new graphql.GraphQLNonNull(JSONType),
        description: 'The new calibration for the channel',
      }
    },
    resolve: async (doc: any, {id, where, calibration}: {id: ?number, where: ?Object, calibration: Calibration}, context: Context): Promise<any> => {
      const {userId} = context
      if (!userId) throw new graphql.GraphQLError('You must be logged in to update LocalIOChannels')
      if (!where) {
        if (id != null) where = {id}
        else throw new Error('id or where must be provided')
      }

      const channel = await LocalIOChannel.findOne({where, attributes: ['config']})
      if (!channel) throw new graphql.GraphQLError('Failed to find LocalIOChannel')
      const {config} = channel
      config.calibration = calibration
      await LocalIOChannel.update({config}, {where, individualHooks: true})
      const result = await LocalIOChannel.findOne({where})
      if (!result) throw new graphql.GraphQLError('Failed to find updated LocalIOChannel')
      return result.get({plain: true, raw: true})
    },
  }
}
