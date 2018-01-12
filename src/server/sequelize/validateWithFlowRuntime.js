// @flow

import t, {validate} from 'flow-runtime'
import {get} from 'lodash'
import type {Type, Validation} from 'flow-runtime'
import type {ErrorTuple} from '../../universal/flow-runtime/ErrorTuple'
import validateSubfields from './validateSubfields'

const arrayType = t.array()
const objectType = t.object()

export default function validateWithFlowRuntime(type: Type<any> | (value: any) => ?Validation): (value: any) => void {
  return validateSubfields(function * (value: any): Iterable<ErrorTuple> {
    const validation = typeof type === 'function'
      ? type(value)
      : validate(type, value)
    if (validation && validation.hasErrors()) {
      for (let [path, message, type] of validation.errors) {
        if (arrayType.acceptsType(type) ||
          objectType.acceptsType(type) ||
          get(validation.input, path) instanceof Object) {
          yield [[...path, '_error'], message]
        }
        else yield [path, message]
      }
    }
  })
}

