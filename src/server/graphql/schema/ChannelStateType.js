// @flow

import type { ChannelState } from '../../../universal/types/Channel'
import { ChannelStateType as ChannelStateValidator } from '../../../universal/types/Channel'
import FlowRuntimeJsonType from './ValidatedJsonType'

const ChannelStateType = new FlowRuntimeJsonType({
  name: 'ChannelState',
  description: 'Represents the realtime state of a Channel',
  validate: (value: mixed): ChannelState => {
    ChannelStateValidator.assert(value)
    return (value: any)
  },
})

export default ChannelStateType

