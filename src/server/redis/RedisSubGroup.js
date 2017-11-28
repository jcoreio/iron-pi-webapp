// @flow

import redisSubscriber from './RedisSubscriber'

type Callback = (channel: string, message: any) => any

function subscribe(channel: string, callback: Callback) {
  if (/\*/.test(channel)) redisSubscriber().psubscribe(channel, callback)
  else redisSubscriber().subscribe(channel, callback)
}

function unsubscribe(channel: string, callback: Callback) {
  if (/\*/.test(channel)) redisSubscriber().punsubscribe(channel, callback)
  else redisSubscriber().unsubscribe(channel, callback)
}

/**
 * Handles subscribing/unsubscribing from channels that were added/removed to/from a set
 * of channels.  If a channel contains a *, it is treated as a pattern subscription.
 */
export default class RedisSubGroup {
  _channels: Set<string>
  _callback: Callback

  /**
   * @param {Set<string>} channels - the channels to initially subscribe to
   */
  constructor(channels: Set<string>, callback: Callback) {
    this._channels = channels
    this._callback = callback
    for (let channel of channels) subscribe(channel, callback)
  }

  /**
   * Changes the entire set of channels subscribed; unsubscribes from anything not in the new set,
   * and subscribes to anything not in the old set.
   */
  changeChannels(newChannels: Set<string>) {
    for (let channel of this._channels) {
      if (!newChannels.has(channel)) unsubscribe(channel, this._callback)
    }
    for (let channel of newChannels) {
      if (!this._channels.has(channel)) subscribe(channel, this._callback)
    }
    this._channels = newChannels
  }

  /**
   * Unsubscribes from all channels.
   */
  unsubscribe() {
    this.changeChannels(new Set())
  }
}

