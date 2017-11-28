// @flow

import {Record as iRecord} from 'immutable'

export interface RecordAPI<T: Object> {
  constructor(init?: $Shape<T>): void;
  get<A>(key: $Keys<T>): A;
  set<A>(key: $Keys<T>, value: A): Record<T>;
  hasIn(keys: Array<any>): boolean;
  update<A>(key: $Keys<T>, updater: (value: A) => A): Record<T>;
  updateIn<A>(path: Array<any>, updater: (value: A) => A): Record<T>;
  merge(values: $Shape<T>): Record<T>;
  mergeDeep(values: $Shape<T>): Record<T>;
  mergeDeepIn(path: Array<any>, values: $Shape<any>): Record<T>;
  withMutations(mutator: (mutable: Record<T>) => any): Record<T>;
  inspect(): string;
  toObject(): T;
  toJS(): Object;
}

export default function Record<T: Object>(spec: T): Class<RecordAPI<T>> {
  return iRecord(spec)
}

