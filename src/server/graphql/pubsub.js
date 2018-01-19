// @flow

import {PubSub} from 'graphql-subscriptions'
import type {PubSubEngine} from 'graphql-subscriptions'

const pubsub: PubSubEngine = new PubSub()
export default pubsub

