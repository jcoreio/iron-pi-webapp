// @flow

import {reify} from 'flow-runtime'
import type {Type} from 'flow-runtime'

export const LogicOperations = {
  AND: {displayText: 'AND'},
  OR: {displayText: 'OR'},
}

export const LogicOperationsArray = Object.keys(LogicOperations)

export type LogicOperation = $Keys<typeof LogicOperations>

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
  operation?: LogicOperation,
  channelId: string,
  comparison: Comparison,
  threshold?: ?number,
}

export type ControlLogic = Array<ControlCondition>

export const ControlLogicType = (reify: Type<ControlLogic>)
ControlLogicType.addConstraint((logic: any) => {
  for (let i = 1; i < logic.length; i++) {
    if (!logic[i].operation) {
      return 'all conditions except the first must have an operation'
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

