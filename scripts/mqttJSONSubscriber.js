#!/usr/bin/env node
/*
  Usage:
   - Start the mqtt broker by running scripts/mqttBroker.
   - Configure the Iron Pi MQTT plugin with the following setings:
     - Server URL: mqtt://<host address>
     - Data topic: 'node/<any node ID>/data'
     - Metadata topic: 'node/<any node ID>/metadata'
     - Channels To MQTT publishing MQTT tags, possibly `channel1`, `channel2`, etc.
   - Run scripts/mqttJSONSubscriber.js
 */

const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://localhost', {
  clientId: 'mqtt-json-subscriber',
  keepalive: 30,
  resubscribe: false,
  // username,
  // password
})

client.on('connect', () => {
  console.log('mqtt connected')
  client.subscribe('#', {qos: 0})
  client.subscribe('node/+/data', {qos: 0})
  client.subscribe('node/+/metadata', {qos: 0})
})

client.on('message', (topic, message) => {
  console.log(`topic: ${topic} message: ${message.toString()}`)
})

client.on('error', (err) => {
  console.error('mqtt client error:', err.stack)
  client.end()
})

client.on('close', () => {
  console.log('mqtt connection closed')
})
