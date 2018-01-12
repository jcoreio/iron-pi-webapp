// @flow

type ErrorTuple = [Array<string | number>, string]

export default function validateSubfields<T>(validator: (value: T) => Iterable<ErrorTuple>): (value: T) => void {
  return function validateSubfields(value: T) {
    const errors = [...validator(value)]
    if (errors.length) {
      throw new Error(JSON.stringify({errors}))
    }
  }
}

