// @flow

import {set} from 'lodash'
import type {GraphQLError} from 'graphql'
import {ValidationError} from 'sequelize'
import type {ValidationErrorItem} from 'sequelize'

function formatMessage(item: ValidationErrorItem): any {
  // $FlowFixMe
  const {validatorKey, validatorArgs} = item
  switch (validatorKey) {
  case 'isEmail': return 'must be a valid Email address'
  case 'isUrl': return 'must be a valid URL'
  case 'isIP': return 'must be a valid IP address'
  case 'isIPv4': return 'must be a valid IPv4 address'
  case 'isIPv6': return 'must be a valid IPv6 address'
  case 'isAlpha': return 'must contain only letters'
  case 'isAlphanumeric': return 'must contain only letters and numbers'
  case 'isNumeric': return 'must be a number'
  case 'isInt': return 'must be a whole number'
  case 'isFloat': return 'must be a floating-point number'
  case 'isDecimal': return 'must be a decimal number'
  case 'isLowercase': return 'must be lowercase'
  case 'isUppercase': return 'must be uppercase'
  case 'notNull': return 'required'
  case 'isNull': return 'must be null'
  case 'notEmpty': return 'must not be empty'
  case 'equals': return `must be ${validatorArgs[0]}`
  case 'contains': return `must contain ${validatorArgs[0]}`
  case 'notIn': return `must not be any of ${validatorArgs[0].join(', ')}`
  case 'isIn': return `must be one of ${validatorArgs[0].join(', ')}`
  case 'notContains': return `must not contain ${validatorArgs[0]}`
  case 'len': return `must be between ${validatorArgs[0][0]} and ${validatorArgs[0][1]} characters long`
  case 'isUUID': return `must be a valid version ${validatorArgs[0]} UUID`
  case 'isDate': return `must be a valid Date`
  case 'isAfter': return `must be after ${validatorArgs[0]}`
  case 'isBefore': return `must be before ${validatorArgs[0]}`
  case 'max': return `must be <= ${validatorArgs[0]}`
  case 'min': return `must be >= ${validatorArgs[0]}`
  case 'isCreditCard': return `must be a valid credit card number`
  }
  return item.message
}

function formatErrorItem(item: ValidationErrorItem, submitErrors: Object): any {
  const {message, path} = item
  try {
    const {errors} = JSON.parse(message)
    for (let error of errors) {
      set(submitErrors, [path, ...error.path], error.message)
    }
  } catch (error) {
    return {path, message: formatMessage(item)}
  }
}

export default function formatError(error: GraphQLError): any {
  const {locations, message, path, originalError} = error
  if (originalError instanceof ValidationError) {
    const submitErrors = {}
    for (let item of originalError.errors) formatErrorItem(item, submitErrors)
    return {submitErrors}
  }
  return {locations, message, path}
}

