// @flow

import {describe, it} from 'mocha'
import {expect} from 'chai'
import roundByIncrement from '../roundByIncrement'

const FLOAT_TOLERANCE = 0.000001

describe('roundByIncrement', () => {
  it('passes through numbers when the increment is null', () => {
    expect(roundByIncrement(0.55, null)).to.equal(0.55)
  })
  it('rounds to the tens place', () => {
    expect(roundByIncrement(0.555, 0.1)).to.be.closeTo(0.6, FLOAT_TOLERANCE)
  })
  it('rounds to whole numbers', () => {
    expect(roundByIncrement(12.876, 1)).to.equal(13)
  })
  it('rounds by tens', () => {
    expect(roundByIncrement(1674, 10)).to.equal(1670)
  })
  it('rounds by increments that are not powers of ten', () => {
    expect(roundByIncrement(15.375, 0.2)).to.be.closeTo(15.4, FLOAT_TOLERANCE)
  })
})
