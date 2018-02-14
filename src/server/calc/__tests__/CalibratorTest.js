import {expect} from 'chai'

import Calibrator from '../Calibrator'

describe("Calibrator", () => {
  it("works correctly with zero points", () => {
    let calibrator = new Calibrator()
    checkPoint(calibrator, -5.5, -5.5)
    checkPoint(calibrator, 0.0, 0.0)
    checkPoint(calibrator, 5.5, 5.5)
  })

  it("works correctly with one (0, 0) point", () => {
    let calibrator = new Calibrator([{ x: 0, y: 0 }])
    checkPoint(calibrator, -5.5, -5.5)
    checkPoint(calibrator, 0.0, 0.0)
    checkPoint(calibrator, 5.5, 5.5)
  })

  it("works correctly with one point", () => {
    let calibrator = new Calibrator([{ x: 0, y: 50 }])
    checkPoint(calibrator, -5.5, 44.5)
    checkPoint(calibrator, 0.0, 50.0)
    checkPoint(calibrator, 5.5, 55.5)
  })

  it("works correctly with two points", () => {
    let calibrator = new Calibrator([{ x: 0, y: 1 }, { x: 1, y: 2.5 }])
    checkPoint(calibrator, 0, 1.0)
    checkPoint(calibrator, 1, 2.5)
    checkPoint(calibrator, 2, 4.0)
  })

  it("works correctly with 3 points", () => {
    let calibrator = new Calibrator([{ x: -1, y: -2 }, { x: 0, y: 0 }, { x: 1, y: 4 }])
    checkPoint(calibrator, -2.0, -4.0)
    checkPoint(calibrator, -1.0, -2.0)
    checkPoint(calibrator, -0.5, -1.0)
    checkPoint(calibrator, 0.0, 0.0)
    checkPoint(calibrator, 0.5, 2.0)
    checkPoint(calibrator, 1.0, 4.0)
  })
})

function checkPoint(calibrator, value, expected) {
  expect(calibrator.calibrate(value)).to.deep.equal(expected)
}
