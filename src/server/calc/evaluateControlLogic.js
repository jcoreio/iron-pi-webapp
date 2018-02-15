/* @flow */

import type {Comparison, ControlCondition, ControlLogic} from '../../universal/types/ControlLogic'

const NUMERIC_COMPARISONS = new Set(['LT', 'LTE', 'GTE', 'GT', 'EQ', 'NE', 'UNAVAILABLE'])

function isNumericComparison(comparison: Comparison): boolean {
  return NUMERIC_COMPARISONS.has(comparison)
}

function isAlarmComparison(comparison: Comparison): boolean {
  // TODO
  return false
}

type EvaluateOptions = {
  getChannelValue: (channelId: string) => ?number,
}

function or(a: ?boolean, b: ?boolean): ?boolean {
  if (a || b) return true
  return (a == null || b == null) ? null : false
}

function and(a: ?boolean, b: ?boolean): ?boolean {
  if (a === false || b === false) return false
  return (a == null || b == null) ? null : true
}

export default function evaluateControlLogic(controlLogic: ControlLogic, options: EvaluateOptions): ?boolean {
  let result = null
  let isFirst = true
  for (let condition of controlLogic) {
    const conditionResult = evaluateCondition(condition, options)
    result = isFirst
      ? conditionResult
      : (('OR' === condition.operation)
        ? or(result, conditionResult)
        : and(result, conditionResult)
      )
    isFirst = false
  }
  return result
}

function evaluateCondition(condition: ControlCondition, {getChannelValue}: EvaluateOptions): ?boolean {
  if (isAlarmComparison(condition.comparison)) {
    // TODO
    // return isAlarmTriggered(condition.channelId, condition.comparison)
  } else if (isNumericComparison(condition.comparison)) {
    const {threshold, comparison} = condition
    const value = getChannelValue(condition.channelId)
    if (comparison === 'UNAVAILABLE') {
      return !Number.isFinite(value)
    }
    if (value == null || !Number.isFinite(value) || threshold == null || !Number.isFinite(threshold)) {
      return null
    }
    switch (comparison) {
    case 'LT': return value < threshold
    case 'LTE': return value <= threshold
    case 'GTE': return value >= threshold
    case 'GT': return value > threshold
    case 'EQ': return value === threshold
    case 'NE': return value !== threshold
    }
  }
  return false
}

