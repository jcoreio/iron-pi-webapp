// @flow

import type {Validator} from 'redux-form/immutable'

export const whitespaceRegExp = /^\s*$/
export const numericRegExp = /^\s*[-+]?(\d+(\.\d*)?|\.\d+)\s*$/
export const integerRegExp = /^\s*[-+]?\d+\s*$/

export function required(value: any): ?string {
  return value == null || (typeof value === 'string' && whitespaceRegExp.test(value)) ? 'Required' : undefined
}
export function notWhitespace(value: any): ?string {
  return typeof value === 'string' && /^\s+$/.test(value) ? 'Must not be just whitespace' : undefined
}
export function minLength(min: number): Validator<?string, any> {
  return (value: ?string) =>
    (typeof value === 'string' && value.length < min ? `Must be at least ${min} characters long` : undefined)
}
export function maxLength(max: number): Validator<?string, any> {
  return (value: ?string) =>
    (typeof value === 'string' && value.length > max ? `Must be ${max} characters long or less` : undefined)
}

export function numeric(value: ?string): ?string {
  return value == null || numericRegExp.test(value) || whitespaceRegExp.test(value) ? undefined : 'Must be a number'
}
export function greaterThan(num: number): Validator<?string, any> {
  return (text: ?string): ?string => {
    if (text == null || !numericRegExp.test(text)) return undefined
    return Number(text) > num ? undefined : 'Must be greater than ' + num
  }
}
export const positive = greaterThan(0)
export function integer(value: ?string): ?string {
  return value == null || integerRegExp.test(value) || whitespaceRegExp.test(value) ? undefined : 'Must be an integer'
}

