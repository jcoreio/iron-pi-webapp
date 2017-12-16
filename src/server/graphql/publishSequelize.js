// @flow

import type {Model, UpdateOptions} from 'sequelize'
import pubsub from './pubsub'
import type {GetTopic} from './getSequelizeTopic'
import {defaultGetTopic} from './getSequelizeTopic'

type PublishOptions = {
  name?: string,
  getTopic?: GetTopic<any>,
}

export default function publishSequelize(
  model: Class<Model<any>>,
  options: PublishOptions = {},
) {
  // const name = options.name || model.name
  const getTopic = (options.getTopic || defaultGetTopic)(model)

  model.afterCreate((instance: Model<any>) => {
    pubsub.publish(getTopic(instance), {create: instance.get({plain: true})})
  })
  model.afterUpdate((instance: Model<any>, {fields}: UpdateOptions<any>) => {
    let values
    if (fields) {
      values = {}
      fields.forEach(field => values[field] = instance.get(field, {plain: true}))
    } else {
      values = instance.get({plain: true})
    }
    pubsub.publish(getTopic(instance), {update: values})
  })
  model.afterDestroy((instance: Model<any>) =>
    pubsub.publish(getTopic(instance), {destroy: null})
  )
}

