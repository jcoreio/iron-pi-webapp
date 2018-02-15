import {expect} from 'chai'

import evaluateControlLogic from '../evaluateControlLogic'

describe("evaluateControlLogic", () => {
  it("evaluates high and low comparisons", () => {
    let tester = new EvalTester()
    tester.values = new Map([['1', 5]])
    let condition = {
      tag: '1',
      comparison: 'GT'
    }
    condition.setpoint = 3
    tester.checkCondition(condition, true)
    condition.setpoint = 5
    tester.checkCondition(condition, false)
    condition.comparison = 'LT'
    tester.checkCondition(condition, false)
    condition.setpoint = 6
    tester.checkCondition(condition, true)
  })
  it("returns null when comparing to a NaN value", () => {
    let tester = new EvalTester()
    tester.values = new Map([['1', NaN]])
    let condition = {
      tag: '1',
      setpoint: 3
    }
    condition.comparison = 'GT'
    tester.checkCondition(condition, null)
    condition.comparison = 'LT'
    tester.checkCondition(condition, null)
  })

  it("returns null when using NaN as a comparison setpoint", () => {
    let tester = new EvalTester()
    tester.values = new Map([['1', 5]])
    let condition = {
      tag: '1',
      setpoint: NaN
    }
    condition.comparison = 'GT'
    tester.checkCondition(condition, null)
    condition.comparison = 'LT'
    tester.checkCondition(condition, null)
  })
  it("returns true when logic is OR between a true condition and an unknown condition", () => {
    let tester = new EvalTester()
    tester.values = new Map([['1', 5], ['2', null]])
    const condition1 = {
      tag: '1',
      comparison: 'GT',
      setpoint: 1,
    }
    const condition2 = {
      tag: '2',
      comparison: 'LT',
      setpoint: 2,
    }
    tester.checkCondition([condition1, {operator: 'OR', ...condition2}], true)
    tester.checkCondition([condition2, {operator: 'OR', ...condition1}], true)
  })
  it("returns null when logic is OR between a false condition and an unknown condition", () => {
    let tester = new EvalTester()
    tester.values = new Map([['1', 5], ['2', null]])
    const condition1 = {
      tag: '1',
      comparison: 'LT',
      setpoint: 1,
    }
    const condition2 = {
      tag: '2',
      comparison: 'LT',
      setpoint: 2,
    }
    tester.checkCondition([condition1, {operator: 'OR', ...condition2}], null)
    tester.checkCondition([condition2, {operator: 'OR', ...condition1}], null)
  })
  it("returns false when logic is AND between a false condition and an unknown condition", () => {
    let tester = new EvalTester()
    tester.values = new Map([['1', 5], ['2', null]])
    const condition1 = {
      tag: '1',
      comparison: 'LT',
      setpoint: 1,
    }
    const condition2 = {
      tag: '2',
      comparison: 'LT',
      setpoint: 2,
    }
    tester.checkCondition([condition1, {operator: 'AND', ...condition2}], false)
    tester.checkCondition([condition2, {operator: 'AND', ...condition1}], false)
  })
  it("returns null when logic is AND between a true condition and an unknown condition", () => {
    let tester = new EvalTester()
    tester.values = new Map([['1', 5], ['2', null]])
    const condition1 = {
      tag: '1',
      comparison: 'GT',
      setpoint: 1,
    }
    const condition2 = {
      tag: '2',
      comparison: 'LT',
      setpoint: 2,
    }
    tester.checkCondition([condition1, {operator: 'AND', ...condition2}], null)
    tester.checkCondition([condition2, {operator: 'AND', ...condition1}], null)
  })
  it("detects unavailable states", () => {
    let tester = new EvalTester()
    tester.values = new Map([['1', 55]])
    let condition = {
      tag: '1',
      comparison: 'UNAVAILABLE'
    }
    tester.checkCondition(condition, false)
    tester.values.set('1', NaN)
    tester.checkCondition(condition, true)
  })
  // it("detects alarms", () => {
  //   let tester = new EvalTester()
  //   tester.alarms = { channel1: [] }
  //   let condition = {
  //     tag: 1,
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
    tester.values = new Map([['1', 55]])
    let condition = {
      tag: '1',
      comparison: 'UNAVAILABLE'
    }
    tester.checkCondition(condition, false)
    tester.values.set('1', NaN)
    tester.checkCondition(condition, true)
  })

  it("evaluates 'AND' conditions correctly", () => {
    let tester = new EvalTester()
    tester.values = new Map([
      ['1', 5],
      ['2', 10],
    ])
    let conditions = [
      {
        tag: '1',
        comparison: 'GT',
        setpoint: 4
      }, {
        operator: 'AND',
        tag: '2',
        comparison: 'GT',
        setpoint: 9
      }
    ]
    tester.checkCondition(conditions, true)

    let c0False = [...conditions]
    c0False[0] = {...c0False[0], setpoint: 5}
    tester.checkCondition(c0False, false)

    let c1False = [...conditions]
    c1False[1] = {...c1False[1], setpoint: 10}
    tester.checkCondition(c1False, false)
  })

  it("evaluates 'OR' conditions correctly", () => {
    let tester = new EvalTester()
    tester.values = new Map([
      ['1', 5],
      ['2', 10],
    ])
    let conditions = [
      {
        tag: '1',
        comparison: 'GT',
        setpoint: 5
      }, {
        operator: 'OR',
        tag: '2',
        comparison: 'GT',
        setpoint: 10
      }
    ]
    tester.checkCondition(conditions, false)

    let c0True = [...conditions]
    c0True[0] = {...c0True[0], setpoint: 4}
    tester.checkCondition(c0True, true)

    let c1True = [...conditions]
    c1True[1] = {...c1True[1], setpoint: 9}
    tester.checkCondition(c1True, true)
  })

  class EvalTester {
    constructor() {
      this.values = new Map()
      // this.alarms = {}
    }
    checkCondition(conditions, expected) {
      let getChannelValue = (tag) => {
        if (!this.values.has(tag)) throw new Error("got an unexpected channel ID: " + tag)
        return this.values.get(tag)
      }
      // let isAlarmTriggered = (tag, alarm) => {
      //   if (!_.has(this.alarms, tag)) throw new Error("got an unexpected channel ID: " + tag)
      //   let alarmsForChannel = this.alarms[tag]
      //   if (!_.isArray(alarmsForChannel)) alarmsForChannel = [ alarmsForChannel ]
      //   return alarmsForChannel.indexOf(alarm) >= 0
      // }
      if (!Array.isArray(conditions)) conditions = [ conditions ]
      expect(evaluateControlLogic(conditions, {getChannelValue})).to.deep.equal(expected)
    }
  }
})

