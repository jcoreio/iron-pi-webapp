// @flow

import {describe, it} from 'mocha'
import {expect} from 'chai'

import roundingToPrecision from '../roundingToPrecision'

describe('roundingToPrecision', () => {
  it('detects the precision of whole number rounding increments from 1 to 100', () => {
    for (let testNum = 1; testNum <= 100; ++testNum) {
      expect(roundingToPrecision(testNum)).to.equal(0)
    }
  })

  it('detects the precision of rounding increments that are powers of 10', () => {
    for (let power = 1; power <= 6; ++power) {
      expect(roundingToPrecision(Math.pow(10, power))).to.equal(0)
    }
  })

  for (let precision = 1, multiplier = 1; precision <= 3; ++precision, multiplier *= 10) {
    it(`detects the precision of rounding increments with precision ${precision}`, () => {
      for (let testNum = 1; testNum < multiplier; ++testNum) {
        const strNum = `${testNum}`.padStart(precision, '0')
        if (!strNum.endsWith('0')) {
          const testNum = parseFloat(`0.${strNum}`)
          expect(roundingToPrecision(testNum)).to.equal(precision)
        }
      }
    })
  }

  it('returns null when the rounding increment is null', () => {
    expect(roundingToPrecision(null)).to.equal(null)
    expect(roundingToPrecision(undefined)).to.equal(null)
  })
})
