// @flow

import * as React from 'react'
import TextField from './TextField'
import {Field, formValues} from 'redux-form'

import ControlWithInfo from './ControlWithInfo'
import {NumericField} from 'redux-form-numeric-field'
import {required, numericality} from '@jcoreio/redux-form-validators'

export type Props = {
  formControlClass?: string,
  firstControlClass?: string,
  lastControlClass?: string,
  min: ?number,
  max: ?number,
}

const unitsAndConfigInfo = (
  <span>
    <p><strong>Units</strong>: Display units for this channel. This system does not automatically perform unit conversions, so you must enter a calibration that converts between the raw input level and the display units.</p>
    <p><strong>Precision</strong>: The number of digits to show after the decimal place in system values for this channel.</p>
  </span>
)

const NumericMetadataItemFields = ({formControlClass, firstControlClass, lastControlClass, min, max}: Props) => (
  <React.Fragment>
    <ControlWithInfo info={unitsAndConfigInfo} className={firstControlClass}>
      <Field
        name="units"
        label="Units"
        type="text"
        component={TextField}
        className={formControlClass}
      />
      <NumericField
        name="storagePrecision"
        label="Storage Precision"
        type="text"
        component={TextField}
        className={formControlClass}
        validate={[required(), numericality({int: true, '>=': 0, '<=': 10})]}
      />
      <NumericField
        name="displayPrecision"
        label="Display Precision"
        type="text"
        component={TextField}
        className={formControlClass}
        validate={[required(), numericality({int: true, '>=': 0, '<=': 10})]}
      />
    </ControlWithInfo>
    <ControlWithInfo info="The display range of guages for this channel" className={lastControlClass}>
      <NumericField
        name="min"
        label="Range Min"
        type="text"
        component={TextField}
        className={formControlClass}
        validate={[required(), (value) => value >= max ? 'must be < max' : undefined]}
      />
      <NumericField
        name="max"
        label="Range Max"
        type="text"
        component={TextField}
        className={formControlClass}
        validate={[required(), (value) => value <= min ? 'must be > min' : undefined]}
      />
    </ControlWithInfo>
  </React.Fragment>
)

export default formValues('min', 'max')(NumericMetadataItemFields)

