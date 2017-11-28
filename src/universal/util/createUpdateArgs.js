// @flow

export default function createUpdateArgs<T: Object>(initial: $Shape<T>, values: $Shape<T>): Array<any> {
  const id = values.id || initial.id
  const value = {id}
  const fields = []

  for (let field in values) {
    if (values[field] !== initial[field]) {
      value[field] = values[field]
      fields.push(field)
    }
  }
  return [value]
}

