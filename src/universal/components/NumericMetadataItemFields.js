// @flow

import * as React from 'react'
import TextField from './TextField'
import {Field} from 'redux-form'
import range from 'lodash.range'
import {MenuItem} from 'material-ui/Menu'

import ControlWithInfo from './ControlWithInfo'
import {NumericField} from 'redux-form-numeric-field'
import {required, numericality} from 'redux-form-validators'

export type Props = {
  formControlClass?: string,
  firstControlClass?: string,
  lastControlClass?: string,
}

const unitsAndConfigInfo = (
  <span>
    <p><strong>Units</strong>: Display units for this channel. This system does not automatically perform unit conversions, so you must enter a calibration that converts between the raw input level and the display units.</p>
    <p><strong>Precision</strong>: The number of digits to show after the decimal place in system values for this channel.</p>
  </span>
)

export default class NumericMetadataItemFields extends React.Component<Props> {
  render(): React.Node {
    const {formControlClass, firstControlClass, lastControlClass} = this.props
    return (
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
            name="rounding"
            label="Storage Precision"
            type="text"
            component={TextField}
            className={formControlClass}
            validate={[numericality({'>': 0})]}
            inputProps={{size: 2}}
          />
          <Field
            name="displayPrecision"
            label="Display Precision"
            component={TextField}
            className={formControlClass}
            validate={required()}
            select
            SelectProps={{
              displayEmpty: true,
              renderValue: precision => `${precision} ${precision === 1 ? 'place' : 'places'}`,
            }}
            props={{onBlur: null}}
          >
            <MenuItem key={0} value={0}>0 decimal places</MenuItem>
            <MenuItem key={1} value={1}>1 decimal place</MenuItem>
            {range(2, 7).map(precision => (
              <MenuItem key={precision} value={precision}>
                {precision} decimal places
              </MenuItem>
            ))}
          </Field>
        </ControlWithInfo>
        <ControlWithInfo info="The display range of guages for this channel" className={lastControlClass}>
          <NumericField
            name="min"
            label="Range Min"
            type="text"
            component={TextField}
            className={formControlClass}
            validate={required()}
            inputProps={{size: 10}}
          />
          <NumericField
            name="max"
            label="Range Max"
            type="text"
            component={TextField}
            className={formControlClass}
            validate={required()}
            inputProps={{size: 10}}
          />
        </ControlWithInfo>
      </React.Fragment>
    )
  }
}


