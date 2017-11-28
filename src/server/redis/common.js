// @flow

export const REDIS_DATA_PREFIX = 'data'

export function toRedisTopic(name: string): string {
  return `${REDIS_DATA_PREFIX}/${name}`
}
