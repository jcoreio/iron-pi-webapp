// @flow

import {describe, it} from 'mocha'
import {expect} from 'chai'
import formatUptime from '../formatUptime'

function duration({days, hours, minutes, seconds, milliseconds}: {
  days?: number,
  hours?: number,
  minutes?: number,
  seconds?: number,
  milliseconds?: number,
}): number {
  return (milliseconds || 0) + (
    (seconds || 0) + (
      (minutes || 0) + (
        (hours || 0) + (days || 0) * 24
      ) * 60
    ) * 60
  ) * 1000
}

describe('formatUptime', () => {
  it('works', () => {
    expect(formatUptime(duration({
      days: 1,
      hours: 3,
      minutes: 4,
      seconds: 5,
      milliseconds: 259,
    }))).to.equal('1 day and 3:04:05')
    expect(formatUptime(duration({
      days: 2,
      hours: 0,
      minutes: 43,
      seconds: 5,
      milliseconds: 259,
    }))).to.equal('2 days and 0:43:05')
    expect(formatUptime(duration({
      hours: 0,
      minutes: 8,
      seconds: 0,
      milliseconds: 259,
    }))).to.equal('0:08:00')
  })
})

