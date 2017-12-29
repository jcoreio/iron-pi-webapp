// @flow

export type ChannelMode = 'ANALOG_INPUT' | 'DIGITAL_INPUT' | 'DIGITAL_OUTPUT' | 'DISABLED'

export const channelIdPart = "[a-z_][a-z0-9_]*"
export const channelIdPattern = new RegExp(`${channelIdPart}(/${channelIdPart})*`, 'i')

export type ChannelState = {
  id: number,
  value: number,
}

export type Channel = {
  id: number,
  name: string,
  channelId: string,
  mode: ChannelMode,
  config: Object,
  state?: ChannelState,
}

