import {expect} from 'chai'

import EventEmitter from 'events'

import DataRouter, {timestampDispatchData} from '../DataRouter'
import type {DataPlugin, InputChangeEvent, CycleDoneEvent, DataPluginMapping} from '../DataRouterTypes'

const EVENT_INPUTS_CHANGED = 'INPUTS_CHANGED'
const EVENT_DISPATCH_CYCLE_DONE = 'DISPATCH_CYCLE_DONE'

type MockPluginEvent = {
  plugin: MockPlugin,
  type: string,
  time: number,
  changedTags: Array<string>,
}

class MockPlugin extends EventEmitter implements DataPlugin {
  _events: Array<MockPluginEvent>;
  _magic: number;
  _mappings: Array<DataPluginMapping>;

  constructor(args: {events: Array<MockPluginEvent>, magic: number, mappings: Array<DataPluginMapping>}) {
    super()
    this._events = args.events
    this._magic = args.magic
    this._mappings = args.mappings
  }
  pluginType(): string { return 'MockPlugin' }
  pluginInstanceId(): string { return this._magic }
  pluginInstanceName(): string { return `instance${this._magic}` }
  inputsChanged(event: InputChangeEvent): void {
    this._events.push({
      ...event,
      plugin: this,
      type: EVENT_INPUTS_CHANGED,
      changedTags: Array.from(event.changedTags).sort()
    })
  }
  dispatchCycleDone(event: CycleDoneEvent): void {
    this._events.push({
      ...event,
      plugin: this,
      type: EVENT_DISPATCH_CYCLE_DONE,
      changedTags: Array.from(event.changedTags).sort()
    })
  }
  ioMappings(): Array<DataPluginMapping> { return this._mappings }
}

describe('DataRouter', () => {
  it('notifies plugins when their inputs change', () => {
    let events: Array<MockPluginEvent> = []
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
