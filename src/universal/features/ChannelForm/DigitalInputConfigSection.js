// @flow

import * as React from 'react'
import classNames from 'classnames'
import {Field} from 'redux-form'
import ControlWithInfo from '../../components/ControlWithInfo'
import ButtonGroupField from '../../components/ButtonGroupField'

export type Props = {
  tallButtonClass: string,
  firstControlClass: string,
  lastControlClass: string,
}

const DigitalInputConfigSection = (
  ({tallButtonClass, firstControlClass, lastControlClass}: Props) => (
    <React.Fragment>
      <ControlWithInfo
        info="Whether the system value should be the opposite of the input value"
        className={classNames(firstControlClass, lastControlClass)}
      >
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

