// @flow

import {Model, Association} from 'sequelize'
import type {FindOptions, IncludeOptions} from 'sequelize'

const {HasOne, HasMany, BelongsTo, BelongsToMany} = Association

/**
 * Given a model, query, and findOne query result, determines all the redis channels we need to subscribe to to find out
 * if the model instance (and included related model instances, if applicable) have changed.
 * This doesn't actually perform the query.
 * @param{Model} model - the sequelize model being queried upon
 * @param{Query} query - the sequelize `findOne` query
 * @param{Object=} result - the result of the query
 */
export default function getFindOneRedisChannels<TAttributes, TInstance: Model<TAttributes>, ModelClass: Class<TInstance>>(
  model: ModelClass,
  query: FindOptions<TAttributes>,
  result?: ?Object,
): Set<string> {
  const includes = query.include instanceof Array ? query.include : []
  const where = query.where instanceof Object ? query.where : {}
  const channels: Set<string> = new Set()
  const {id} = (where: Object)
  if (typeof id === 'number') channels.add(`collection/${model.tableName}/${id}`)

  if (includes) {
    for (let _include of includes) {
      const include: IncludeOptions<TAttributes, TInstance> = _include instanceof Model ? {model: _include} : (_include: any)

      const association = include.association || (include.model && model.getAssociationForAlias(include.model, include.as))

      if (!association) continue

      const allTargetEvents = `collection/${association.target.tableName}/*`
      const specificTargetEvent = new RegExp(`collection/${association.target.tableName}/\\d+`)

      if (association instanceof BelongsToMany) {
        const {through} = association
        if (!through) continue // (should never be the case, this is to silence flow errors)
        channels.add(
          typeof id === 'number'
            ? `collection/${through.model.tableName}/${association.foreignKey}/${id}`
            : `collection/${through.model.tableName}/*/*`
        )
      } else if (association instanceof BelongsTo) {
        const foreignId = result && result[association.foreignKey]
        const subchannel = typeof foreignId === 'number' ? foreignId : '*'
        channels.add(`collection/${association.target.tableName}/${subchannel}`)
      } else if (association instanceof HasMany) {
        // channels for the target collection don't include the foreign key unfortunately, so we have to listen to all
        channels.add(allTargetEvents)
      } else if (association instanceof HasOne) {
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

