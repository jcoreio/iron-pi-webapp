// @flow

import t, {validate} from 'flow-runtime'
import {get} from 'lodash'
import type {Type, Validation} from 'flow-runtime'
import type {ErrorTuple} from '../../universal/flow-runtime/ErrorTuple'

const arrayType = t.array()

export default function validateWithFlowRuntime(type: Type<any> | (value: any) => ?Validation): (value: any) => void {
  return (value: any) => {
    const validation = typeof type === 'function'
      ? type(value)
      : validate(type, value)
    if (validation && validation.hasErrors()) {
      const {errors} = validation
      const json = JSON.stringify({
        errors: errors.map(([path, message, type]: ErrorTuple) => {
          if (arrayType.acceptsType(type) || Array.isArray(get(validation.input, path))) {
            return {path: [...path, '_error'], message}
          }
          return {path, message}
        })
      })
      throw new Error(json)
    }
  }
}

