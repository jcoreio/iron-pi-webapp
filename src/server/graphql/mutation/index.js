// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'
import type {GraphQLOutputType, GraphQLInputType} from 'graphql'
import setUsername from './setUsername'
import updateCalibration from './updateCalibration'
import updateChannel from './updateChannel'
import setChannelValues from './setChannelValues'
import setChannelValue from './setChannelValue'
import type {Store} from '../../redux/types'

type Options = {
  sequelize: Sequelize,
  store: Store,
  types: {[name: string]: GraphQLOutputType},
  inputTypes: {[name: string]: GraphQLInputType},
}

export default function createMutation(options: Options): graphql.GraphQLObjectType {
  return new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: {
      setUsername: setUsername(options),
      updateCalibration: updateCalibration(options),
      updateChannel: updateChannel(options),
      setChannelValue: setChannelValue(options),
      setChannelValues: setChannelValues(options),
    },
  })
}

