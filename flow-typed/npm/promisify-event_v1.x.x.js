// flow-typed signature: 0f232e10310c9bf0fe1f1401ffb99425
// flow-typed version: 7ced459f77/promisify-event_v1.x.x/flow_>=v0.32.x

// @flow

declare module 'promisify-event' {
  declare module.exports: (emitter: events$EventEmitter, event: string) => Promise<any> & {
    cancel: () => void,
  }
}

