// @flow

export default function roundByIncrement(value: number, rounding: ?number): number {
  if (rounding && rounding > 0) {
    const prefloor = value >= 0 ? value + rounding / 2 : value - rounding / 2
    return prefloor - (prefloor % rounding)
  } else {
    return value
  }
}
