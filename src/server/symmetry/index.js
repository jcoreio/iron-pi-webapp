// @flow

import _ from 'lodash'
import logger from '../../universal/logger'

import type {MethodsDef, PublicationsDef, CollectionMethodsDef, CollectionPublicationsDef} from './types'

export var globalMethods: MethodsDef = {}
export var globalPublications: PublicationsDef = {}

const log = logger('Symmetry:server:index')

export default {
  methods,
  collectionMethods,
  publish,
  collectionPublications,
}

export function methods(def: MethodsDef) {
  _.forOwn(def, (method: Function, methodName: string) => {
    if (typeof method !== 'function') throw Error(`methods must be functions`)
    if (globalMethods[methodName]) log.warn(Error(`re-defining method ${methodName}`).stack)
    globalMethods[methodName] = method
  })
}

export function publish(def: PublicationsDef) {
  _.forOwn(def, (handler: Function, publicationName: string) => {
    if (typeof handler !== 'function') throw Error(`publications must be functions`)
    if (globalPublications[publicationName]) log.warn(Error(`re-defining publication for ${publicationName}`).stack)
    globalPublications[publicationName] = handler
  })
}

export function collectionMethods(collectionMethodsDef: CollectionMethodsDef) {
  const methodsDef: MethodsDef = {}
  _.forOwn(collectionMethodsDef, (collectionMethods: MethodsDef, collectionName: string) => {
    _.forOwn(collectionMethods, (method: Function, methodName: string) => {
      methodsDef[`${collectionName}.${methodName}`] = method
    })
  })
  methods(methodsDef)
}

export function collectionPublications(collectionPublicationsDef: CollectionPublicationsDef) {
  const publicationsDef: PublicationsDef = {}
  _.forOwn(collectionPublicationsDef, (collectionPublications: PublicationsDef, collectionName: string) => {
    _.forOwn(collectionPublications, (publication: Function, publicationName: string) => {
      publicationsDef[`${collectionName}.${publicationName}`] = publication
    })
  })
  publish(publicationsDef)
}

