// @flow

import * as graphql from 'graphql'
import type {GraphQLContext} from '../../../graphql/GraphQLContext'
import updateLocalIOChannel from './updateLocalIOChannel'
import updateLocalIOChannelCalibration from './updateLocalIOChannelCalibration'
import type {LocalIOFeature} from '../../LocalIOFeature'

const addMutationFields = (feature: LocalIOFeature) => ({types, inputTypes, mutationFields}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  inputTypes: {[name: string]: graphql.GraphQLInputType},
  mutationFields: {[name: string]: graphql.GraphQLFieldConfig<any, GraphQLContext>},
}) => {
  mutationFields.updateLocalIOChannel = updateLocalIOChannel({feature, types, inputTypes})
  mutationFields.updateLocalIOChannelCalibration = updateLocalIOChannelCalibration({types})
}
export default addMutationFields

