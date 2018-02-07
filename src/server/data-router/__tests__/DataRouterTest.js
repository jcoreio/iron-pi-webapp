import {expect} from 'chai'

import {timestampDispatchData} from '../DataRouter'

describe('DataRouter', () => {
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
