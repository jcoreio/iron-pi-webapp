// @flow

import {expect} from 'chai'

import EventEmitter from 'events'
import _ from 'lodash'

import DataRouter, {timestampDispatchData} from '../DataRouter'
import type {DataPlugin, InputChangeEvent, CycleDoneEvent, DataPluginMapping, TimeValuePair} from '../DataRouterTypes'

const EVENT_INPUTS_CHANGED = 'INPUTS_CHANGED'
const EVENT_DISPATCH_CYCLE_DONE = 'DISPATCH_CYCLE_DONE'

type MockPluginEvent = {
  plugin: MockPlugin,
  type: string,
  time: number,
  changedTags: Array<string>,
}

type MockPluginArgs = {events: Array<MockPluginEvent>, magic: number, mappings: Array<DataPluginMapping>}

class MockPlugin extends EventEmitter implements DataPlugin {
  _rxEvents: Array<MockPluginEvent>;
  _magic: number;
  _mappings: Array<DataPluginMapping>;

  constructor(args: MockPluginArgs) {
    super()
    this._rxEvents = args.events
    this._magic = args.magic
    this._mappings = args.mappings
  }
  pluginType(): string { return 'MockPlugin' }
  pluginInstanceId(): string { return `mockPlugin${this._magic}` }
  pluginInstanceName(): string { return `Mock Plugin ${this._magic}` }
  inputsChanged(event: InputChangeEvent) {
    this._pushEvent({event, type: EVENT_INPUTS_CHANGED})
  }
  dispatchCycleDone(event: CycleDoneEvent) {
    this._pushEvent({event, type: EVENT_DISPATCH_CYCLE_DONE})
  }
  _pushEvent(args: {event: InputChangeEvent, type: string}) {
    // make events easier to deep compare by omitting tagMap and converting changedTags into a sorted array
    this._rxEvents.push({
      ...(_.omit(args.event, 'tagMap')),
      plugin: this,
      type: args.type,
      changedTags: Array.from(args.event.changedTags).sort()
    })
  }
  ioMappings(): Array<DataPluginMapping> { return this._mappings }
}

class AdderPlugin extends MockPlugin {
  _sourceTag: string;
  _destTag: string;
  _amount: number;
  constructor(args: {events: Array<MockPluginEvent>, magic: number,
      sourceTag: string, destTag: string, amount?: number}) {
    super({events: args.events, magic: args.magic, mappings: [
      {id: 'adderInput', name: 'Adder Input', tagsToPlugin: [args.sourceTag]},
      {id: 'adderOutput', name: 'Adder Output', tagFromPlugin: args.destTag}
    ]})
    this._sourceTag = args.sourceTag
    this._destTag = args.destTag
    this._amount = args.amount === undefined ? 1 : args.amount
  }
  inputsChanged(event: InputChangeEvent) {
    super.inputsChanged(event)
    const srcValuePair: ?TimeValuePair = event.tagMap[this._sourceTag]
    this.emit('data', {[this._destTag]: srcValuePair ? srcValuePair.v + 1 : NaN})
  }
}

describe('DataRouter', () => {
  it('notifies plugins when their inputs change', () => {
    const events: Array<MockPluginEvent> = []
    const popEvents = () => {
      const _events = events.slice(0)
      events.splice(0, events.length)
      return _events
    }

    const plugin1 = new MockPlugin({events, magic: 1, mappings: [
      {id: 'output1', name: 'Output 1', tagFromPlugin: 'a'},
      {id: 'output2', name: 'Output 2', tagFromPlugin: 'b'}
    ]})
    const plugin2 = new MockPlugin({events, magic: 2, mappings: [
      {id: 'input1', name: 'Input 1', tagsToPlugin: ['a']},
      {id: 'input2', name: 'Input 2', tagsToPlugin: ['b']}
    ]})

    let time = 100
    const router: DataRouter = new DataRouter({plugins: [plugin1, plugin2]})
    router._getTime = () => time

    expect(popEvents()).to.be.empty

    router.dispatch({pluginId: plugin1.pluginInstanceId(), timestampedValues: {
      a: {t: 100, v: 200},
      b: {t: 300, v: 400}
    }})

    expect(popEvents()).to.deep.equal([
      {plugin: plugin2, type: EVENT_INPUTS_CHANGED, time, changedTags: ['a', 'b']},
      {plugin: plugin1, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b'], inputsChanged: false},
      {plugin: plugin2, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b'], inputsChanged: true}
    ])
  })

  it('handles cascading updates', () => {
    const events: Array<MockPluginEvent> = []
    const popEvents = () => {
      const _events = events.slice(0)
      events.splice(0, events.length)
      return _events
    }

    const sourcePlugin = new MockPlugin({events, magic: 1, mappings: [
      {id: 'output1', name: 'Output 1', tagFromPlugin: 'a'},
      {id: 'output2', name: 'Output 2', tagFromPlugin: 'b'}
    ]})
    const adder1 = new AdderPlugin({
      events,
      magic: 2,
      sourceTag: 'a',
      destTag: 'c'
    })
    const adder2 = new AdderPlugin({
      events,
      magic: 3,
      sourceTag: 'c',
      destTag: 'd'
    })

    let time = 100
    const router: DataRouter = new DataRouter({plugins: [sourcePlugin, adder1, adder2]})
    router._getTime = () => time

    expect(popEvents()).to.be.empty

    router.dispatch({pluginId: sourcePlugin.pluginInstanceId(), values: {a: 2, b: 3}})

    expect(popEvents()).to.deep.equal([
      {plugin: adder1, type: EVENT_INPUTS_CHANGED, time, changedTags: ['a', 'b']},
      {plugin: adder2, type: EVENT_INPUTS_CHANGED, time, changedTags: ['c']},
      {plugin: sourcePlugin, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b', 'c', 'd'], inputsChanged: false},
      {plugin: adder1, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b', 'c', 'd'], inputsChanged: true},
      {plugin: adder2, type: EVENT_DISPATCH_CYCLE_DONE, time, changedTags: ['a', 'b', 'c', 'd'], inputsChanged: true}
    ])
  })

  describe('timestampDispatchData', () => {
    const PLUGIN_ID = 'testPluginId'

    it('adds timestamps to data', () => {
      const PLUGIN_ID = 'testPluginId'
      const eventIn = {
        pluginId: PLUGIN_ID,
        values: {
          a: 1,
          b: 2
        }
      }
      const t = Date.now()
      const eventOut = timestampDispatchData({event: eventIn, time: t})
      expect(eventOut).to.deep.equal({
        pluginId: PLUGIN_ID,
        timestampedValues: {
          a: {t, v: 1},
          b: {t, v: 2}
        }
      })
    })

    it('passes through already-timestamped data', () => {
      const eventIn = {
        pluginId: PLUGIN_ID,
        timestampedValues: {
          a: {
            t: 1000,
            v: 1
          },
          b: {
            t: 2000,
            v: 2
          }
        }
      }
      const eventOut = timestampDispatchData({event: eventIn, time: 0})
      expect(eventOut).to.deep.equal(eventIn)
    })

    it('merges timestamped and non-timestamped data', () => {
      const PLUGIN_ID = 'testPluginId'
      const eventIn = {
        pluginId: PLUGIN_ID,
        values: {
          a: 1,
          b: 2
        },
        timestampedValues: {
          b: {
            t: 1000,
            v: 3
          },
          c: {
            t: 2000,
            v: 4
          }
        }
      }
      const t = Date.now()
      const eventOut = timestampDispatchData({event: eventIn, time: t})
      expect(eventOut).to.deep.equal({
        pluginId: PLUGIN_ID,
        timestampedValues: {
          a: {t, v: 1},
          b: {t: 1000, v: 3},
          c: {t: 2000, v: 4}
        }
      })
    })
  })
})
