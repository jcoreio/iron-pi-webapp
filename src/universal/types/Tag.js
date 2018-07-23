// @flow
/* @flow-runtime enable */

import {reify} from 'flow-runtime'
import type {Type} from 'flow-runtime'

export const tagPart = "[a-z_][a-z0-9_]*"
export const tagPattern = new RegExp(`^${tagPart}(/${tagPart})*$`, 'i')

export type Tag = string
export const TagType = (reify: Type<Tag>)

export const INTERNAL = '_internal/'

// "settable" tags exist so that Local IO values can be exported by the Local IO plugin,
// but can be set from another plugin like an MQTT connector.
const tagSetPrefix = `${INTERNAL}tagSet/`
export const tagToSetCommand = (tag: string) => `${tagSetPrefix}${tag}`
export const setCommandToTag: (command: string) => ?string = (command: string) =>
  command.startsWith(tagSetPrefix) ? command.substring(tagSetPrefix.length) : null

TagType.addConstraint((tag: string) => {
  if (!tagPattern.test(tag)) return 'Must be a valid tag'
})

