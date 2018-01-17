// @flow

import {describe} from 'mocha'

module.exports = () => (
  describe('ChannelForm', () => {
    require('./AnalogInputMode')()
    require('./DigitalInputMode')()
    require('./DigitalOutputMode')()
  })
)

