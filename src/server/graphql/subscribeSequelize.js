// @flow

import type {Model} from 'sequelize'
import pubsub from './pubsub'
import type {GetTopic} from './getSequelizeTopic'
import {defaultGetTopic} from './getSequelizeTopic'

type SubscribeOptions<TAttributes> = {
  getTopic?: GetTopic<TAttributes>,
}

export default function subscribeSequelize<TAttributes>(
  model: Class<Model<TAttributes>>,
  options: SubscribeOptions<TAttributes> = {},
): (rootValue: any, args: Object) => AsyncIterator<$Shape<TAttributes>> {
  const getTopic = (options.getTopic || defaultGetTopic)(model)

  return (rootValue: any, args: Object): AsyncIterator<$Shape<TAttributes>> => {
    const topic = getTopic(args)
    return pubsub.asyncIterator(topic)
  }
}


