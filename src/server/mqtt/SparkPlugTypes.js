// @flow

import EventEmitter from '@jcoreio/typed-event-emitter'

export const SPARKPLUG_VERSION_B_1_0 = 'spBv1.0'

/** Metric sent during a NDATA message */
export type SparkPlugDataMertic = {
  name: string,
  value: any,
  type: string,
}

export type SparkPlugDataMessage = {
  timestamp: number,
  metrics: Array<SparkPlugDataMertic>,
}

export type SparkplugTypedValue = {
  type: string,
  value: any,
}

/** Metric sent during a NBIRTH message */
export type SparkPlugBirthMetric = SparkPlugDataMertic & {
  properties: {
    longName: SparkplugTypedValue,
    min?: ?SparkplugTypedValue,
    max?: ?SparkplugTypedValue,
    units?: ?SparkplugTypedValue,
  },
}

export type SparkPlugBirthMessage = {
  timestamp: number,
  metrics: Array<SparkPlugBirthMetric>,
}

export type SparkPlugPublishOpts = {

}

export type SparkPlugAppMessage = {
  messageType: string,
  groupId: string,
  edgeNode: string,
  payload: Object,
}

export type SparkPlugClientEventTypes = {
  birth: [],
  connect: [],
  close: [],
  reconnect: [],
  error: [any],
  appMessage: [SparkPlugAppMessage],
  ncmd: [Object],
  dcmd: [string, Object],
}

export type SparkPlugClient = EventEmitter<SparkPlugClientEventTypes> & {
  publishNodeBirth(payload: SparkPlugBirthMessage, options?: SparkPlugPublishOpts): void,
  publishNodeData(payload: SparkPlugDataMessage, options?: SparkPlugPublishOpts): void,
}

export type SparkPlugNewClientOpts = {
  serverUrl: string,
  username: ?string,
  password: ?string,
  groupId: string,
  edgeNode: string,
  clientId: string,
  version: string,
}

export type SparkPlugPackage = {
  newClient(opts: SparkPlugNewClientOpts): SparkPlugClient,
}
