/* @flow */

export type CalPoint = {
  x: number,
  y: number,
}

export type CalibratorConfig = {
  points: Array<CalPoint>,
}

type CalSegment = {
  x: number,
  slope: number,
  offset: number,
}

export default class Calibrator {
  points: Array<CalPoint>
  segments: Array<CalSegment>

  constructor(rawPoints: Array<CalPoint> = []) {
    // Copy the points array, sort it by x coordinate, and remove duplicates.
    let points = rawPoints.slice(0).sort((a, b) => a.x - b.x)
    let prev = undefined
    for (let pointIdx = 0; pointIdx < points.length;) {
      let { x } = points[pointIdx]
      if (x === prev)
        points.splice(pointIdx, 1)
      else
        ++pointIdx
      prev = x
    }
    this.points = points
    this.segments = []
    if (rawPoints.length >= 2) {
      for (let pointIdx = 0; pointIdx < rawPoints.length - 1; ++pointIdx) {
        const { x: x1, y: y1 } = points[pointIdx]
        const { x: x2, y: y2 } = points[pointIdx + 1]
        const dx = x2 - x1
        const dy = y2 - y1
        const slope = dx === 0 ? 0 : dy / dx // The dx === 0 case should never happen, because we removed duplicate points
        const offset = y1 - (slope * x1)
        this.segments.push({ x: x1, slope, offset })
      }
    } else {
      let offset = rawPoints.length === 1 ? rawPoints[0].y - rawPoints[0].x : 0
      this.segments.push({ x: 0, slope: 1, offset })
    }
  }

  calibrate(inputValue: number): number {
    let curSegment = this.segments[0]
    for (let segment of this.segments) {
      if (segment.x > inputValue)
        break
      curSegment = segment
    }
    return curSegment.slope * inputValue + curSegment.offset
  }
}

