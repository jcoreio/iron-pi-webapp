import {expect} from 'chai'

import DataRouter, {timestampDispatchData} from '../DataRouter'
import type {DataPlugin, InputChangeEvent, CycleDoneEvent, DataPluginMapping} from '../DataRouterTypes'

const EVENT_INPUTS_CHANGED = 'INPUTS_CHANGED'
const EVENT_DISPATCH_CYCLE_DONE = 'DISPATCH_CYCLE_DONE'

type MockPluginEvent = {
  type: string,
  payload: Object
}

class MockPlugin implements DataPlugin {
  _magic: number;
  _mappings: Array<DataPluginMapping>;
  _events: Array<MockPluginEvent> = [];

  constructor(args: {magic: number, mappings: Array<DataPluginMapping>}) {
    this._magic = args.magic
    this._mappings = args.mappings
  }
  pluginType(): string { return 'MockPlugin' }
  pluginInstanceId(): string { return this._magic }
  pluginInstanceName(): string { return `instance${this._magic}` }
  inputsChanged(event: InputChangeEvent): void {
    this._events.push({type: EVENT_INPUTS_CHANGED, payload: event})
  }
  dispatchCycleDone(event: CycleDoneEvent): void {
    this._events.push({type: EVENT_DISPATCH_CYCLE_DONE, payload: event})
  }
  ioMappings(): Array<DataPluginMapping> { return this._mappings }

  popEvents(): Array<MockPluginEvent> {
    const events = this._events
    this._events = []
    return events
  }
}

describe('DataRouter', () => {
  it('notifies plugins when their inputs change', () => {
    const plugin1 = new MockPlugin({magic: 1, mappings: [
      {id: 'output1', name: 'Output 1', tagFromPlugin: 'a'},
      {id: 'output2', name: 'Output 2', tagFromPlugin: 'b'}
    ]})
    const plugin2 = new MockPlugin({magic: 2, mappings: [
      {id: 'input1', name: 'Input 1', tagsToPlugin: ['a']},
      {id: 'input2', name: 'Input 2', tagsToPlugin: ['b']}
    ]})
    const router: DataRouter = new DataRouter({plugins: [plugin1, plugin2]})
    expect(plugin1.popEvents()).to.be.empty
    expect(plugin2.popEvents()).to.be.empty

    router.dispatch({pluginId: plugin1.pluginInstanceId(), timestampedValues: {
      a: {t: 100, v: 200},
      b: {t: 300, v: 400}
    }})
    const plugin1Events = plugin1.popEvents()
    expect(plugin1Events.length).to.equal(1)
    expect(plugin1Events[0].type).to.equal(EVENT_DISPATCH_CYCLE_DONE)
    expect(plugin1Events[0].payload.inputsChanged).to.equal(false)

    const plugin2Events = plugin2.popEvents()
    expect(plugin2Events.length).to.equal(2)

    expect(plugin2Events[0].type).to.equal(EVENT_INPUTS_CHANGED)
    expect(Array.from(plugin2Events[0].payload.changedTags).sort()).to.deep.equal(['a', 'b'])

    expect(plugin2Events[1].type).to.equal(EVENT_DISPATCH_CYCLE_DONE)
    expect(plugin2Events[1].payload.inputsChanged).to.equal(true)
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
