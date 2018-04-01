// @flow

type MQTTPluginStatus = 'connecting' | 'connected' | 'error'

export const MQTT_PLUGIN_STATUS_CONNECTING = 'connecting'
export const MQTT_PLUGIN_STATUS_CONNECTED = 'connected'
export const MQTT_PLUGIN_STATUS_ERROR = 'error'

export const MQTTPluginStatusesArray = [
  MQTT_PLUGIN_STATUS_CONNECTING,
  MQTT_PLUGIN_STATUS_CONNECTED,
  MQTT_PLUGIN_STATUS_ERROR,
]

export type MQTTPluginState = {
  id: number,
  status: MQTTPluginStatus,
  error?: ?string,
  connectedSince?: ?number,
}

