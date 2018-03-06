// @flow

export function mqttConfigForm(id: number): string {
  return `/mqtt/config/${id}`
}

export function mqttChannelConfigForm(baseUrl: string, id: number): string {
  return `${baseUrl}/channel/${id}`
}

