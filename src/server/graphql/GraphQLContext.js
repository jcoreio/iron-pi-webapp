// @flow

import type Sequelize from 'sequelize'
import type DataRouter from '../data-router/DataRouter'
import type MetadataHandler from '../metadata/MetadataHandler'
import type {PubSubEngine} from 'graphql-subscriptions'
import type ConnectModeHandler from '../device/ConnectModeHandler'
import type AccessCodeHandler from '../device/AccessCodeHandler'
import type {SSHHandler} from '../device/SSHHandler'
import type {NetworkSettingsHandler} from '../network-settings/NetworkSettingsHandler'

export type GraphQLDependencies = {
  dataRouter: DataRouter,
  metadataHandler: MetadataHandler,
  connectModeHandler: ConnectModeHandler,
  accessCodeHandler: AccessCodeHandler,
  networkSettingsHandler: NetworkSettingsHandler,
  sshHandler: SSHHandler,
  pubsub: PubSubEngine,
  sequelize: Sequelize,
}

export type GraphQLContext = GraphQLDependencies & {
  userId: ?number,
  scopes: Set<string>,
}

