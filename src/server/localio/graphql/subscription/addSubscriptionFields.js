// @flow

import * as graphql from 'graphql'
import type {Context} from '../../../graphql/Context'

export default function addSubscriptionFields({types, inputTypes, subscriptionFields}: {
  types: {[name: string]: graphql.GraphQLOutputType},
  subscriptionFields: {[name: string]: graphql.GraphQLFieldConfig<any, Context>},
}) {
}

