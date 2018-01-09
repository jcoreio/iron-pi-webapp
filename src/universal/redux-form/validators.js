// @flow

export function required(value: any): ?string {
  if (value == null || (typeof value === 'string' && /^\s*$/.test(value))) return 'Required'
}
