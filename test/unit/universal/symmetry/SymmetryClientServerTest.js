// @flow

import {assert} from 'chai'
import {describe, it} from 'mocha'

import EventEmitter from 'events'

import SymmetryClient from '../../../../src/client/symmetry/SymmetryClient'
import Symmetry from '../../../../src/server/symmetry'
import SymmetryServerConn from '../../../../src/server/symmetry/SymmetryServer'
import { SYM_SUB_EVENT, SYM_UNSUB, SYM_EVENT, SYM_METHOD, SYM_RESULT} from '../../../../src/universal/symmetry/SymmetryProto'

import type EventSubContext from '../../../../src/universal/symmetry/SubContext'
import type {MethodsDef, PublicationsDef, SubContext, MethodContext} from '../../../../src/server/symmetry/types'

class MockSock extends EventEmitter {
  sent: Array<string> = [];
  readyState = 1; // OPEN
  other: ?Object;

  constructor() {
    super()
  }
  send(message: string) {
    this.sent.push(message)
    this.emit('send', { data: message })
  }
  close() { }
  checkAndSend(types: Array<string> | string) {
    const typesArr: Array<string> = Array.isArray(types) ? types : [types]
    const count = typesArr.length
    if (this.sent.length !== count) {
      throw Error("message mismatch: \nexpected: [ " + typesArr.join(", ") +
        " ]\ngot: [ " + this.sent.join(", ") + "].")
    }
    for (let msgIdx = 0; msgIdx < count; ++msgIdx) {
      const message = JSON.parse(this.sent[msgIdx])
      const type = typesArr[msgIdx]
      if (message.msg !== type) throw new Error("message type should be " + type + ", was " + message.msg)
      this.other && this.other._handleMessage(message)
    }
    this.sent.splice(0, count)
  }
}

type ClientServerTesterOpts = {
  methods?: MethodsDef,
  publications?: PublicationsDef
}

class ClientServerTester {
  serverSock: MockSock = new MockSock();
  clientSock: MockSock = new MockSock();
  server: SymmetryServerConn
  client: SymmetryClient

  constructor(options: ClientServerTesterOpts = {}) {
    const {methods, publications} = options
    this.server = new SymmetryServerConn({
      socket: this.serverSock,
      publications,
      methods
    })
    this.client = new SymmetryClient(this.clientSock)
    this.serverSock.other = this.client
    this.clientSock.other = this.server
  }
}

describe("symmetry client / server", () => {
  it("handles event subscriptions using EventEmitter-style client handles", () => {
    const PUBLICATION_NAME = 'snakesOnPlane'
    let subServerContext: ?SubContext
    const subArg1 = {fright: 'extreme'}
    const subArg2 = 'thisIsBad'
    let serverStopEventsCount = 0

    const publications: PublicationsDef = {
      [PUBLICATION_NAME](context: SubContext, arg1: Object, arg2: string) {
        assert(!subServerContext) // Should only be called once
        assert.deepEqual(arg1, subArg1)
        assert.equal(arg2, subArg2)
        subServerContext = context
        context.onStop(() => {++serverStopEventsCount})
      }
    }

    const tester = new ClientServerTester({publications})

    const clientHandle: EventSubContext = tester.client.subscribe(PUBLICATION_NAME, subArg1, subArg2)

    let snakeTypesOnPlane: Array<string> = []
    clientHandle.on('snake', (snakeType: string) => snakeTypesOnPlane.push(snakeType))

    tester.clientSock.checkAndSend(SYM_SUB_EVENT)
    if (!subServerContext) throw Error('missing subscription handle')

    // Make sure that the subDef is making a proper round trip, and that events are getting
    // delivered to the correct listeners.
    subServerContext.emit('snake', 'cobra')

    tester.serverSock.checkAndSend(SYM_EVENT)
    assert.equal(snakeTypesOnPlane.length, 1)
    assert.equal(snakeTypesOnPlane[0], 'cobra')
    snakeTypesOnPlane = []

    // Make sure the unsubscribe works right
    clientHandle.stop()

    assert.equal(serverStopEventsCount, 0)
    clientHandle.stop()
    tester.clientSock.checkAndSend(SYM_UNSUB)
    assert.equal(serverStopEventsCount, 1)

    // After the subscription has been stopped, new events shouldn't pass through
    subServerContext.emit('snake', 'python')
    assert.equal(snakeTypesOnPlane.length, 0)
  })

  it("handles event subscriptions using a client callback", () => {
    const PUBLICATION_NAME = 'snakeEject'
    let subServerContext: ?SubContext
    const publications: PublicationsDef = {
      [PUBLICATION_NAME](context: SubContext) {
        subServerContext = context
      }
    }

    const tester = new ClientServerTester({publications})

    const clientRxEvents: Array<Object> = []
    tester.client.subscribe(PUBLICATION_NAME, (event: Object) => clientRxEvents.push(event))

    tester.clientSock.checkAndSend(SYM_SUB_EVENT)
    if (!subServerContext) throw Error('missing subscription handle')

    // Make sure that the subDef is making a proper round trip, and that events are getting
    // delivered to the correct listeners.
    const testEvent = {eventData: 'dataValue'}
    subServerContext.emit('event', testEvent)

    tester.serverSock.checkAndSend(SYM_EVENT)
    assert.equal(clientRxEvents.length, 1)
    assert.deepEqual(clientRxEvents[0], testEvent)
  })

  it("handles method calls dispatched to synchronous method providers", async function (): Promise<void> {
    let _tester: ?ClientServerTester
    const methods = {
      deSnakePlane(context: MethodContext, arg1: Object, arg2: Object): Array<Object> {
        if (!_tester) throw Error('un initialized tester')
        assert.equal(context.connection, _tester.server)
        return [arg1, arg2]
      }
    }
    const tester = _tester = new ClientServerTester({methods})

    let arg1 = { killThem: 'maybe' }
    let arg2 = { getRidOfThem: 'definitely' }
    const promise = tester.client.call('deSnakePlane', arg1, arg2)
    tester.clientSock.checkAndSend([SYM_METHOD])
    tester.serverSock.checkAndSend([SYM_RESULT])

    const result = await promise
    assert.deepEqual(result, [arg1, arg2])
  })

  it("handles synchronous global methods", async function (): Promise<void> {
    const tester = new ClientServerTester()

    Symmetry.methods({
      testGlobalMethod(context: MethodContext, arg1: Object, arg2: Object): Array<Object> {
        assert.equal(context.connection, tester.server)
        return [arg1, arg2]
      }
    })

    let arg1 = { killThem: 'maybe' }
    let arg2 = { getRidOfThem: 'definitely' }
    const promise = tester.client.call('testGlobalMethod', arg1, arg2)
    tester.clientSock.checkAndSend([SYM_METHOD])
    tester.serverSock.checkAndSend([SYM_RESULT])

    const result = await promise
    assert.deepEqual(result, [arg1, arg2])
  })

  it("handles method calls dispatched to asynchronous method providers", async function (): Promise<void> {
    let _tester: ?ClientServerTester
    const methodCalls = []
    const methods = {
      deSnakePlane(context: MethodContext, arg1: Object, arg2: Object): Promise<void> {
        if (!_tester) throw Error('un initialized _tester')
        assert.equal(context.connection, _tester.server)
        return new Promise((resolve: Function): void => {
          methodCalls.push({arg1, arg2, resolve})
        })
      }
    }
    const tester = _tester = new ClientServerTester({methods})

    let arg1 = { killThem: 'maybe' }
    let arg2 = { getRidOfThem: 'definitely' }
    const promise = tester.client.call('deSnakePlane', arg1, arg2)
    tester.clientSock.checkAndSend([SYM_METHOD])
    // Since it's a async handler that doesn't immediately call its callback, we
    // shouldn't have a response yet.
    tester.serverSock.checkAndSend([])

    assert.equal(methodCalls.length, 1)
    assert.deepEqual({arg1: methodCalls[0].arg1, arg2: methodCalls[0].arg2}, {arg1, arg2})

    const RESOLVE_VALUE = {something: 'good', somethingElse: 'notGood'}
    methodCalls[0].resolve(RESOLVE_VALUE)
    // Pause for a second to allow the previous promise resolution to be handled
    await new Promise(resolve => setTimeout(resolve, 1))

    tester.serverSock.checkAndSend([SYM_RESULT])

    const result = await promise
    assert.deepEqual(result, RESOLVE_VALUE)
  })
})
