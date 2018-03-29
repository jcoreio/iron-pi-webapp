// @flow

import ExtendableError from 'es6-error'
import type {Validation} from 'flow-runtime'
import type {FieldValidation} from 'sequelize-validate-subfields'
import {convertValidationErrors} from 'sequelize-validate-subfields-flow-runtime'

export default class FlowValidationError extends ExtendableError {
  validation: {
    errors: Array<FieldValidation>,
  }

  constructor(message: string, path: string | Array<string>, validation: Validation) {
    super(message)
    const errors = [...convertValidationErrors(validation, {reduxFormStyle: true})]
    if (Array.isArray(path)) {
      for (let error of errors) error.path.unshift(...path)
    } else if (typeof path === 'string') {
      for (let error of errors) error.path.unshift(path)
    }
    this.validation = {errors}
  }
}


