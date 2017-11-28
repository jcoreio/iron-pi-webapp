// @flow

// We could use these messages later if we need to detect
// different protocol versions

//// Client to server
//export const SYM_CONNECT = 'connect'
//// Server to client
//export const SYM_CONNECTED = 'connected'
//export const SYM_FAILED = 'failed'

// Messages for connected and authenticated clients

// Client to server messages
export const SYM_SUB_COLLECTION = 'sub'
export const SYM_SUB_EVENT = 'subEvent'

export const SYM_MOD_SUB = 'modSub'
export const SYM_UNSUB = 'unsub'
export const SYM_METHOD = 'method'

// Server to client messages
export const SYM_EVENT = 'event'
export const SYM_CHANGED = 'changed'
export const SYM_READY = 'ready'
export const SYM_RESULT = 'result'
export const SYM_NOSUB = 'nosub'
// Bidirectional messages
export const SYM_PING = 'ping'
export const SYM_PONG = 'pong'
export const SYM_ERROR = 'error'
