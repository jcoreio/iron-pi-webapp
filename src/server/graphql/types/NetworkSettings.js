// @flow

import * as graphql from 'graphql'

const NetworkSettings = new graphql.GraphQLObjectType({
  name: 'NetworkSettings',
  fields: {
    dhcpEnabled: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean),
    },
    ipAddress: {
      type: graphql.GraphQLString,
    },
    netmask: {
      type: graphql.GraphQLString,
    },
    gateway: {
      type: graphql.GraphQLString,
    },
    dnsServers: {
      type: graphql.GraphQLString,
    },
  },
})

export default NetworkSettings

export const InputNetworkSettings = new graphql.GraphQLInputObjectType({
  name: 'InputNetworkSettings',
  fields: {
    dhcpEnabled: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean),
    },
    ipAddress: {
      type: graphql.GraphQLString,
    },
    netmask: {
      type: graphql.GraphQLString,
    },
    gateway: {
      type: graphql.GraphQLString,
    },
    dnsServers: {
      type: graphql.GraphQLString,
    },
  },
})

