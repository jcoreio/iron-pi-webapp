#!/usr/bin/env node

//import range from 'lodash.range'
//import sparkplug from 'sparkplug-client'

const range = require('lodash.range')
const sparkplug = require('sparkplug-client')


//import type {SparkPlugClient, SparkPlugPackage} from '../src/server/mqtt/SparkPlugTypes'

const TARGET_GROUP_ID = 'My Group'
const TARGET_NODE_ID = 'My Node'

const client = sparkplug.newClient({
  serverUrl: 'mqtt://localhost:1883',
  clientId: `jcore-applicaiton-node-id`,
  username: null,
  password: null,
  isApplication: true,
})

client.on('error', err => console.error(`MQTT error: ${err.stack || err}`))

const NUM_OUTPUTS = 4
let curOutputIdx = -1
const OUTPUTS_OFFSET = 5

setInterval(() => {
  if (++curOutputIdx >= NUM_OUTPUTS)
    curOutputIdx = 0

  const metrics = range(NUM_OUTPUTS).map((outputIdx) => ({
    name: `channel${outputIdx + OUTPUTS_OFFSET}`,
    type: 'Float',
    value: outputIdx === curOutputIdx ? 1 : 0,
  }))

  client.publishNodeCommand({
    groupId: TARGET_GROUP_ID,
    nodeId: TARGET_NODE_ID,
    metrics
  })
}, 2000)
