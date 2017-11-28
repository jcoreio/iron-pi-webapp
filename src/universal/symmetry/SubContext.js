// @flow

import EventEmitter from 'events'

type AnyEventListener = (eventName: string, ...args: Array<any>) => any

export default class SubContext extends EventEmitter {
  stop: () => void;
  _anyEventListeners: Array<AnyEventListener> = [];

  constructor(args: {stop: () => void}) {
    super()
    this.stop = args.stop
  }

  onAnyEvent(listener: AnyEventListener): SubContext {
    this._anyEventListeners.push(listener)
    return this
  }

  removeAnyEventListener(listener: AnyEventListener): SubContext {
    const index = this._anyEventListeners.indexOf(listener)
    if (index >= 0) this._anyEventListeners.splice(index, 1)
    return this
  }

  emit(eventName: string, ...args: Array<any>): boolean {
    this._anyEventListeners.forEach(listener => listener(eventName, ...args))
    const hasOwnListeners = super.emit(eventName, ...args)
    return hasOwnListeners || !!this._anyEventListeners.length
  }
}
