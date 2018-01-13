// @flow

export function channelForm(id: number): string {
  return `/channel/${id}`
}

export function calibrationForm(id: number): string {
  return `${channelForm(id)}/${CALIBRATION}`
}

export const CALIBRATION = 'calibration'
export const CALIBRATION_TABLE = 'table'

