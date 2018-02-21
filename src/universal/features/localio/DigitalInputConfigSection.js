// @flow

import * as React from 'react'
import classNames from 'classnames'
import {Field} from 'redux-form'
import ControlWithInfo from '../../components/ControlWithInfo'
import ButtonGroupField from '../../components/ButtonGroupField'
import {required} from '@jcoreio/redux-form-validators'

export type Props = {
  tallButtonClass: string,
  firstControlClass: string,
  lastControlClass: string,
}

const polarityInfo = (
  <span>
    <p>Optionally inverts the logic level of the input:</p>
    <p><strong>Normal</strong>: Logic level is not inverted</p>
    <p><strong>Reversed</strong>: Logic level is inverted</p>
  </span>
)

const DigitalInputConfigSection = (
  ({tallButtonClass, firstControlClass, lastControlClass}: Props) => (
    <React.Fragment>
      <ControlWithInfo
        info={polarityInfo}
        className={classNames(firstControlClass, lastControlClass)}
      >
        <Field
          name="config.reversePolarity"
          label="Polarity"
          component={ButtonGroupField}
          buttonClassName={tallButtonClass}
          availableValues={[false, true]}
          getDisplayText={value => value ? 'Reversed' : 'Normal'}
          validate={required()}
        />
      </ControlWithInfo>
    </React.Fragment>
  )
)

export default DigitalInputConfigSection

