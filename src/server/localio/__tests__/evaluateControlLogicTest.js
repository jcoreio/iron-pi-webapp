import {expect} from 'chai'

import evaluateControlLogic from '../evaluateControlLogic'

describe("evaluateControlLogic", () => {
  it("evaluates high and low comparisons", () => {
    let tester = new EvalTester()
    tester.values = new Map([[1, 5]])
    let condition = {
      channelId: 1,
      comparison: 'GT'
    }
    condition.threshold = 3
    tester.checkCondition(condition, true)
    condition.threshold = 5
    tester.checkCondition(condition, false)
    condition.comparison = 'LT'
    tester.checkCondition(condition, false)
    condition.threshold = 6
    tester.checkCondition(condition, true)
  })
  it("returns false when comparing to a NaN value", () => {
    let tester = new EvalTester()
    tester.values = new Map([[1, NaN]])
    let condition = {
      channelId: 1,
      threshold: 3
    }
    condition.comparison = 'GT'
    tester.checkCondition(condition, false)
    condition.comparison = 'LT'
    tester.checkCondition(condition, false)
  })

  it("returns false when using NaN as a comparison threshold", () => {
    let tester = new EvalTester()
    tester.values = new Map([[1, 5]])
    let condition = {
      channelId: 1,
      threshold: NaN
    }
    condition.comparison = 'GT'
    tester.checkCondition(condition, false)
    condition.comparison = 'LT'
    tester.checkCondition(condition, false)
  })
  it("detects unavailable states", () => {
    let tester = new EvalTester()
    tester.values = new Map([[1, 55]])
    let condition = {
      channelId: 1,
      comparison: 'UNAVAILABLE'
    }
    tester.checkCondition(condition, false)
    tester.values.set(1, NaN)
    tester.checkCondition(condition, true)
  })
  // it("detects alarms", () => {
  //   let tester = new EvalTester()
  //   tester.alarms = { channel1: [] }
  //   let condition = {
  //     channelId: 1,
  //     comparison: 'highAlarm'
  //   }
  //   tester.checkCondition(condition, false)
  //   tester.alarms.channel1 = 'highWarning'
  //   tester.checkCondition(condition, false)
  //   tester.alarms.channel1 = 'highAlarm'
  //   tester.checkCondition(condition, true)
  // })
  it("detects unavailable states", () => {
    let tester = new EvalTester()
    tester.values = new Map([[1, 55]])
    let condition = {
      channelId: 1,
      comparison: 'UNAVAILABLE'
    }
    tester.checkCondition(condition, false)
    tester.values.set(1, NaN)
    tester.checkCondition(condition, true)
  })

  it("evaluates 'AND' conditions correctly", () => {
    let tester = new EvalTester()
    tester.values = new Map([
      [1, 5],
      [2, 10],
    ])
    let conditions = [
      {
        channelId: 1,
        comparison: 'GT',
        threshold: 4
      }, {
        operation: 'AND',
        channelId: 2,
        comparison: 'GT',
        threshold: 9
      }
    ]
    tester.checkCondition(conditions, true)

    let c0False = [...conditions]
    c0False[0] = {...c0False[0], threshold: 5}
    tester.checkCondition(c0False, false)

    let c1False = [...conditions]
    c1False[1] = {...c1False[1], threshold: 10}
    tester.checkCondition(c1False, false)
  })

  it("evaluates 'OR' conditions correctly", () => {
    let tester = new EvalTester()
    tester.values = new Map([
      [1, 5],
      [2, 10],
    ])
    let conditions = [
      {
        channelId: 1,
        comparison: 'GT',
        threshold: 5
      }, {
        operation: 'OR',
        channelId: 2,
        comparison: 'GT',
        threshold: 10
      }
    ]
    tester.checkCondition(conditions, false)

    let c0True = [...conditions]
    c0True[0] = {...c0True[0], threshold: 4}
    tester.checkCondition(c0True, true)

    let c1True = [...conditions]
    c1True[1] = {...c1True[1], threshold: 9}
    tester.checkCondition(c1True, true)
  })

  class EvalTester {
    constructor() {
      this.values = new Map()
      // this.alarms = {}
    }
    checkCondition(conditions, expected) {
      let getChannelValue = (channelId) => {
        if (!this.values.has(channelId)) throw new Error("got an unexpected channel ID: " + channelId)
        return this.values.get(channelId)
      }
      // let isAlarmTriggered = (channelId, alarm) => {
      //   if (!_.has(this.alarms, channelId)) throw new Error("got an unexpected channel ID: " + channelId)
      //   let alarmsForChannel = this.alarms[channelId]
      //   if (!_.isArray(alarmsForChannel)) alarmsForChannel = [ alarmsForChannel ]
      //   return alarmsForChannel.indexOf(alarm) >= 0
      // }
      if (!Array.isArray(conditions)) conditions = [ conditions ]
      expect(evaluateControlLogic(conditions, {getChannelValue})).to.deep.equal(expected)
    }
  }
})

