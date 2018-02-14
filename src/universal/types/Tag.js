// @flow

import {reify} from 'flow-runtime'
import type {Type} from 'flow-runtime'

export const tagPart = "[a-z_][a-z0-9_]*"
export const tagPattern = new RegExp(`^${tagPart}(/${tagPart})*$`, 'i')

export type Tag = string
export const TagType = (reify: Type<Tag>)

export const INTERNAL = '_internal'

TagType.addConstraint((tag: string) => {
  if (!tagPattern.test(tag)) return 'Must be a valid tag'
})

