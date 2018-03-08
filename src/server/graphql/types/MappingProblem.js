// @flow

import * as graphql from 'graphql'

export const MappingLocationInfo = new graphql.GraphQLObjectType({
  name: 'MappingLocationInfo',
  fields: {
    pluginType: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
    pluginId: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
    pluginName: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
    channelId: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
    channelName: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
  }
})

export const MappingProblemKind = new graphql.GraphQLEnumType({
  name: 'MappingProblemKind',
  values: {
    multipleSources: {value: 'multipleSources'},
    noSource: {value: 'noSource'},
  },
})

const MappingProblem = new graphql.GraphQLObjectType({
  name: 'MappingProblem',
  fields: {
    mappingLocation: {type: new graphql.GraphQLNonNull(MappingLocationInfo)},
    tag: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
    problem: {type: new graphql.GraphQLNonNull(MappingProblemKind)},
    additionalSources: {type: new graphql.GraphQLList(new graphql.GraphQLNonNull(MappingLocationInfo))},
  }
})

export default MappingProblem
