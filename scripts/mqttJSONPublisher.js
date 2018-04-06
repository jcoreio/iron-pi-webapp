#!/usr/bin/env node
/*
  Usage:
   - Start the mqtt broker by running scripts/mqttBroker.
   - Configure the Iron Pi MQTT plugin with the following setings:
     - Server URL: mqtt://<host address>
     - Data From MQTT topic: 'node/node1/commands'
     - Channels To MQTT publishing MQTT tags, possibly `channel1`, `channel2`, etc.
   - Run scripts/mqttJSONSubscriber.js
 */

const range = require('lodash.range')
const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://localhost', {
  clientId: 'mqtt-json-publisher',
  keepalive: 30,
  resubscribe: false,
  // username,
  // password
})

client.on('connect', () => {
  console.log('mqtt connected')
})

const NUM_OUTPUTS = 4
let curOutputIdx = -1
const OUTPUTS_OFFSET = 5

setInterval(() => {
  if (++curOutputIdx >= NUM_OUTPUTS)
    curOutputIdx = 0
  const data = {}
  range(NUM_OUTPUTS).forEach(outputIdx =>
    data[`channel${outputIdx + OUTPUTS_OFFSET}`] = outputIdx === curOutputIdx ? 1 : 0)

  client.publish('node/node1/commands', JSON.stringify({timestamp: Date.now(), data}))
}, 2000)

client.on('error', (err) => {
  console.error('mqtt client error:', err.stack)
  client.end()
})

client.on('close', () => {
  console.log('mqtt connection closed')
})
