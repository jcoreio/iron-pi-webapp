// @flow

import * as graphql from 'graphql'

const NetworkSettings = new graphql.GraphQLObjectType({
  name: 'NetworkSettings',
  fields: {
    dhcpEnabled: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean),
    },
    ipAddress: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    netmask: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    gateway: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
    dnsServers: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
    },
  }
})

export default NetworkSettings

