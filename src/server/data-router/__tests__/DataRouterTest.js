import {assert, expect} from 'chai'

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
      const now = Date.now()
      const eventOut = timestampDispatchData(eventIn)
      assert(eventOut)
      const {pluginId, timestampedValues} = eventOut
      expect(pluginId).to.equal(PLUGIN_ID)
      expect(Object.keys(timestampedValues)).to.deep.equal(['a', 'b'])
      const {a, b} = timestampedValues
      expect(a.v).to.equal(1)
      expect(b.v).to.equal(2)
      const maxTimestamp = now + 50
      expect(a.t).to.be.within(now, maxTimestamp)
      expect(b.t).to.be.within(now, maxTimestamp)
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
      const eventOut = timestampDispatchData(eventIn)
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
      const now = Date.now()
      const eventOut = timestampDispatchData(eventIn)
      assert(eventOut)
      const {pluginId, timestampedValues} = eventOut
      expect(pluginId).to.equal(PLUGIN_ID)
      expect(Object.keys(timestampedValues)).to.deep.equal(['a', 'b', 'c'])
      const {a, b, c} = timestampedValues
      expect(a.v).to.equal(1)
      const maxTimestamp = now + 50
      expect(a.t).to.be.within(now, maxTimestamp)
      // Already-timestamped data should be passed through unmodified.
      // When an item is present in both values and valuesWithTimestamps,
      // the entry in valueWithTimestamps should take precedence.
      expect(b).to.deep.equal({t: 1000, v: 3})
      expect(c).to.deep.equal({t: 2000, v: 4})
    })
  })
})
