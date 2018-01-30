// @flow

import * as React from 'react'
import {withRouter, Link} from 'react-router-dom'
import TextField from '../../components/TextField'
import {Field} from 'redux-form'

import ControlWithInfo from '../../components/ControlWithInfo'
import DrilldownButton from '../../components/DrilldownButton'
import {CALIBRATION} from '../../react-router/routePaths'
import {NumericField} from 'redux-form-numeric-field'
import {required, numericality} from '@jcoreio/redux-form-validators'

export type Props = {
  formControlClass: string,
  firstControlClass: string,
  lastControlClass: string,
  match: {
    url: string,
  },
}

const unitsAndConfigInfo = (
  <span>
    <p><strong>Units</strong>: Display units for this channel. This system does not automatically perform unit conversions, so you must enter a calibration that converts between the raw input level and the display units.</p>
    <p><strong>Precision</strong>: The number of digits to show after the decimal place in system values for this channel.</p>
  </span>
)

const AnalogInputConfigSection = ({formControlClass, firstControlClass, lastControlClass, match}: Props) => (
  <React.Fragment>
    <ControlWithInfo info={unitsAndConfigInfo} className={firstControlClass}>
      <Field
        name="config.units"
        label="Units"
        type="text"
        component={TextField}
        className={formControlClass}
      />
      <NumericField
        name="config.precision"
        label="Precision"
        type="text"
        component={TextField}
        className={formControlClass}
        validate={[required(), numericality({int: true, '>=': 0, '<=': 10})]}
      />
    </ControlWithInfo>
    <ControlWithInfo info="The display range of guages for this channel" className={firstControlClass}>
      <NumericField
        name="config.min"
        label="Range Min"
        type="text"
        component={TextField}
        className={formControlClass}
        validate={[required(), (value, {config: {max}}) => value >= max ? 'must be < max' : undefined]}
      />
      <NumericField
        name="config.max"
        label="Range Max"
        type="text"
        component={TextField}
        className={formControlClass}
        validate={[required(), (value, {config: {min}}) => value <= min ? 'must be > min' : undefined]}
      />
    </ControlWithInfo>
    <ControlWithInfo
      info="The calibration allows you to enter a linear conversion between the Raw Input and the System Value"
      className={lastControlClass}
    >
      <DrilldownButton
        className={formControlClass}
        component={Link}
        raised
        to={`${match.url}/${CALIBRATION}`}
      >
        Calibration
      </DrilldownButton>
    </ControlWithInfo>
  </React.Fragment>
)


export default withRouter(AnalogInputConfigSection)

