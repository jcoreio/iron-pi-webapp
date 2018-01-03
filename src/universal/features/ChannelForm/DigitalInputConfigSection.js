// @flow

import * as React from 'react'
import {Field} from 'redux-form'
import ControlWithInfo from '../../components/ControlWithInfo'
import ButtonGroupField from '../../components/ButtonGroupField'

export type Props = {
  tallButtonClass: string,
}

const DigitalInputConfigSection = (
  ({tallButtonClass}: Props) => (
    <React.Fragment>
      <ControlWithInfo info="Whether the system value should be the opposite of the input value">
        <Field
          name="config.reversePolarity"
          label="Polarity"
          component={ButtonGroupField}
          buttonClassName={tallButtonClass}
          availableValues={[false, true]}
          getDisplayText={value => value ? 'Reversed' : 'Normal'}
        />
      </ControlWithInfo>
    </React.Fragment>
  )
)

export default DigitalInputConfigSection

