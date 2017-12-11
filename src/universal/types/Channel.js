// @flow

export type ChannelMode = 'ANALOG_INPUT' | 'DIGITAL_INPUT' | 'DIGITAL_OUTPUT' | 'DISABLED'

export type Channel = {
  id: number,
  name: string,
  channelId: string,
  mode: ChannelMode,
  config: Object,
}


