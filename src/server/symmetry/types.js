// @flow

import type SymmetryServer from './SymmetryServer'
import type {ServerUser} from '../types/ServerUser'

export type MethodsDef = {[methodName: string]: Function}
export type PublicationsDef = {[publicationName: string]: Function}

// Context sent in 'this' argument of method calls
export type MethodContext = {
  connection: SymmetryServer,
  user: ?ServerUser,
  userId: ?number,
}

// Context sent to subscription handlers
export type SubContext = MethodContext & {
  emit: (eventName: string, ...payload: Array<any>) => void, // Handler emits an event
  stop: (err?: any) => void, // Handler stops the subscription
  onStop: (callback: () => void) => void, // Handler registers a callback that fires when the client disconnects or stops the subscription
}

export type CollectionMethodsDef = {[collectionName: string]: MethodsDef}
export type CollectionPublicationsDef = {[collectionName: string]: MethodsDef}
