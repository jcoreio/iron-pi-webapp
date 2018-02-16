// @flow

import type Sequelize from 'sequelize'
import * as graphql from 'graphql'
import {defaultArgs, resolver} from 'graphql-sequelize'

import requireUserId from '../requireUserId'
import type {Context} from '../Context'
import User from '../../models/User'
import type {GraphQLFeature} from '../GraphQLFeature'
import models from '../../models'
import createTagValue from './TagValue'
import MetadataItem from '../types/MetadataItem'

type Options = {
  sequelize: Sequelize,
  types: {[name: string]: graphql.GraphQLOutputType},
  features: Array<$Subtype<GraphQLFeature>>,
}

export default function createQuery(options: Options): graphql.GraphQLObjectType {
  const {sequelize, types, features} = options

  const queryFields = {
    currentUser: {
      type: types[User.name],
      resolve: async (obj: any, args: any, context: Context): Promise<any> => {
        const {userId: id} = context
        if (id) {
          const user = await User.findOne({where: {id}})
          if (user) return user.get({plain: true, raw: true})
        }
        return null
      },
    },
    TagValue: createTagValue(),
    MetadataItem: {
      type: MetadataItem,
      args: {
        tag: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString),
        },
      },
      resolve: (obj: any, {tag}: {tag: string}, {metadataHandler}: Context) => {
        const metadata = metadataHandler.getTagMetadata(tag)
        return metadata ? {...metadata, tag} : null
      }
    },
    Metadata: {
      type: new graphql.GraphQLList(new graphql.GraphQLNonNull(MetadataItem)),
      resolve: (obj: any, args: any, {metadataHandler}: Context) => {
        const metadata = []
        const map = metadataHandler.metadata()
        for (let tag in map) {
          metadata.push({...map[tag], tag})
        }
        return metadata
      }
    },
  }

  for (let name in models) {
    switch (name) {
    case User.name:
    case 'SequelizeMeta':
      continue
    }
    const model = models[name]
    const type = types[model.options.name.singular]
    if (!type) continue

    const {options}: { options: { name: { singular: string, plural: string } } } = (model: any)

    if (!queryFields[options.name.singular]) queryFields[options.name.singular] = {
      type,
      args: defaultArgs(model),
      resolve: resolver(model, {before: requireUserId}),
    }
    if (!queryFields[options.name.plural]) queryFields[options.name.plural] = {
      type: new graphql.GraphQLList(type),
      args: defaultArgs(model),
      resolve: resolver(model, {before: requireUserId}),
    }
  }

  for (let feature of features) {
    if (feature.addQueryFields) feature.addQueryFields({sequelize, types, queryFields})
  }

  const query = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: queryFields,
  })

  return query
}

