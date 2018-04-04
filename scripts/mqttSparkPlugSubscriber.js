#!/usr/bin/env node
/*
  Usage:
   - Start the mqtt broker by running scripts/mqttBroker.
   - Configure the Iron Pi MQTT plugin with the following setings:
     - Server URL: mqtt://<host address>
     - Group ID: 'My Group'
     - Node ID: 'My Node'
     - Channels To MQTT publishing MQTT tags, possibly `channel1`, `channel2`, etc.
       Avoid publishing to `channel5` thru `channel8` if you're also using
       mqttSparkPlugPublisher, which publishes to those tags.
   - Run scripts/mqttSparkPlugSubscriber.js
 */

const sparkplug = require('sparkplug-client')

const client = sparkplug.newClient({
  serverUrl: 'mqtt://localhost:1883',
  clientId: `jcore-subscriber-node-id`,
  username: null,
  password: null,
  isApplication: true,
})

client.on('error', err => console.error(`MQTT error: ${err.stack || err}`))
client.on('appMessage', msg => {
  const {groupId, edgeNode, payload: {metrics}} = msg
  const strMetrics = metrics.map(metric => {
    const {properties} = metric
    if (properties) {
      const propValue = propName => properties[propName].value
      return `  ${metric.name}: name: ${propValue('longName')} range: ${propValue('min')} - ${propValue('max')} units: ${propValue('units')} value: ${metric.value}`
    } else {
      return `  ${metric.name}: ${metric.value}`
    }
  }).join('\n')
  console.log(`group: ${groupId} node: ${edgeNode}\n${strMetrics}`)
})
