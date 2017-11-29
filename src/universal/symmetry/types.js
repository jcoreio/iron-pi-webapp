// @flow

export type HistoricalSubDef = {
  channelIds: Array<string>,
  beginTime: number,
  endTime?: ?number,
}

export type SymmetryErr = {
  message: string,
  code?: string,
}
