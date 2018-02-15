// @flow

import {reify} from 'flow-runtime'
import type {Type} from 'flow-runtime'

export const LogicOperators = {
  AND: {displayText: 'AND'},
  OR: {displayText: 'OR'},
}

export const LogicOperatorsArray = Object.keys(LogicOperators)

export type LogicOperator = $Keys<typeof LogicOperators>

export const Comparisons = {
  GT: {displayText: '>'},
  GTE: {displayText: '>='},
  LT: {displayText: '<'},
  LTE: {displayText: '<='},
  EQ: {displayText: '='},
  NE: {displayText: '!='},
  UNAVAILABLE: {displayText: 'unavailable'},
}

export const ComparisonsArray = Object.keys(Comparisons)

export type Comparison = $Keys<typeof Comparisons>

export type ControlCondition = {
  operator?: LogicOperator,
  tag: string,
  comparison: Comparison,
  setpoint?: ?number,
}

export type ControlLogic = Array<ControlCondition>

export const ControlLogicType = (reify: Type<ControlLogic>)
ControlLogicType.addConstraint((logic: any) => {
  for (let i = 1; i < logic.length; i++) {
    if (!logic[i].operator) {
      return 'all conditions except the first must have an operator'
    }
  }
})

export type NonEmptyControlLogic = ControlLogic
export const NonEmptyControlLogicType = (reify: Type<NonEmptyControlLogic>)
NonEmptyControlLogicType.addConstraint((logic: any) => {
  if (!logic.length) {
    return 'must have at least one condition'
  }
})

