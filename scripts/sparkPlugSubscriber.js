#!/usr/bin/env node

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
