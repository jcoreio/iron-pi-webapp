// @flow

const MAX_PRECISION_TO_DETECT = 6

export default function roundingToPrecision(rounding: ?number): ?number {
  if (rounding == null) return null
  for (let precision = 0, mult = 1; precision <= MAX_PRECISION_TO_DETECT; ++precision, mult *= 10) {
    const toWholeNum = rounding * mult
    const deltaUp = toWholeNum % 1
    const deltaDown = 1 - deltaUp
    const delta = Math.min(deltaUp, deltaDown)
    if (delta < 0.00000001)
      return precision
  }
  return null
}
