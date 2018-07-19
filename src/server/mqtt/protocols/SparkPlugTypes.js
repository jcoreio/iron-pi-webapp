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
  properties?: {
    longName?: SparkplugTypedValue,
    min?: ?SparkplugTypedValue,
    max?: ?SparkplugTypedValue,
    units?: ?SparkplugTypedValue,
  },
}

export type SparkPlugBirthMessage = {
  timestamp: number,
  metrics: Array<SparkPlugBirthMetric>,
}

export type SparkPlugNCMDRequest = {
  groupId: string,
  nodeId: string,
  timestamp?: number,
  metrics: Array<SparkPlugDataMertic>,
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
  publishNodeCommand(request: SparkPlugNCMDRequest): void,
  stop(): void,
}

export type SparkPlugCommonClientOpts = {
  serverUrl: string,
  username: ?string,
  password: ?string,
  clientId: string,
  version?: string,
}

export type SparkPlugEdgeClientOpts = SparkPlugCommonClientOpts & {
  groupId: string,
  edgeNode: string,
}

export type SparkPlugApplicationClientOpts = SparkPlugCommonClientOpts & {
  isApplication: true,
}

export type SparkPlugNewClientOpts = SparkPlugEdgeClientOpts | SparkPlugApplicationClientOpts

export type SparkPlugPackage = {
  newClient(opts: SparkPlugNewClientOpts): SparkPlugClient,
}
