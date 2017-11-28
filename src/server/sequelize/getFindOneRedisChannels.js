// @flow

import {Model} from 'sequelize'

type Include = {
  model: Model,
  as?: any,
  association?: Association,
  include?: Array<Include | Model>,
}

type Association = {
  associationType: 'BelongsToMany' | 'BelongsTo' | 'HasMany',
  source: Model,
  target: Model,
  throughModel?: Model,
  sourceKey?: string,
  foreignKey: string,
  otherKey?: string,
  targetKey?: string,
  as?: string,
  isAliased: boolean,
  isSingleAssociation: boolean,
  isSelfAssociation: boolean,
  sourceKeyIsPrimary?: boolean,
}

type Query = {
  where?: Object,
  include?: Array<Include | Model>,
}

/**
 * Given a model, query, and findOne query result, determines all the redis channels we need to subscribe to to find out
 * if the model instance (and included related model instances, if applicable) have changed.
 * This doesn't actually perform the query.
 * @param{Model} model - the sequelize model being queried upon
 * @param{Query} query - the sequelize `findOne` query
 * @param{Object=} result - the result of the query
 */
export default function getFindOneRedisChannels(
  model: Model,
  {where, include: includes}: Query,
  result?: ?Object
): Set<string> {
  const channels: Set<string> = new Set()
  const {id} = where || {}
  if (typeof id === 'number') channels.add(`collection/${model.tableName}/${id}`)

  if (includes) {
    for (let include of includes) {
      if (include instanceof Model) include = ({model: include}: Include)

      const association: Association = include.association || model.getAssociation(include.model, include.as)

      if (!association) continue
      const {associationType} = association

      const allTargetEvents = `collection/${association.target.tableName}/*`
      const specificTargetEvent = new RegExp(`collection/${association.target.tableName}/\\d+`)

      if (associationType === 'BelongsToMany') {
        const {throughModel} = association
        if (!throughModel) continue // (should never be the case, this is to silence flow errors)
        channels.add(
          typeof id === 'number'
            ? `collection/${throughModel.tableName}/${association.foreignKey}/${id}`
            : `collection/${throughModel.tableName}/*/*`
        )
      } else if (associationType === 'BelongsTo') {
        const foreignId = result && result[association.foreignKey]
        const subchannel = typeof foreignId === 'number' ? foreignId : '*'
        channels.add(`collection/${association.target.tableName}/${subchannel}`)
      } else if (associationType === 'HasMany') {
        // channels for the target collection don't include the foreign key unfortunately, so we have to listen to all
        channels.add(allTargetEvents)
      } else {
        // if the foreign key is the primary key, we can listen only to events for result's id.
        // otherwise, we have to listen to all events...
        const sourceId = result ? result[association.sourceKey] : null
        const subchannel = association.target.attributes[association.foreignKey].primaryKey && sourceId != null
          ? sourceId
          : '*'
        channels.add(`collection/${association.target.tableName}/${subchannel}`)
      }

      let associatedResults = result && result[association.as]
      if (associatedResults) {
        if (!Array.isArray(associatedResults)) associatedResults = [associatedResults]
        for (let associatedResult of associatedResults) {
          // handle nested includes
          const relatedChannels = getFindOneRedisChannels(
            association.target,
            {
              where: {id: associatedResult.id},
              include: include.include,
            },
            associatedResult
          )
          for (let channel of relatedChannels) {
            // don't subscribe to specific ids on the target model if we're already subscribing to all ids
            // (if association is HasMany)
            if (channels.has(allTargetEvents) && specificTargetEvent.test(channel)) continue
            channels.add(channel)
          }
        }
      }
    }
  }

  return channels
}

