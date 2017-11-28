// @flow

import {reify} from 'flow-runtime'
import type {Type} from 'flow-runtime'

export type NonEmptyString = string

const NotEmptyStringType = (reify: Type<NonEmptyString>)

NotEmptyStringType.addConstraint((input: string) => {
  if (input.length === 0) return 'cannot be empty'
})

