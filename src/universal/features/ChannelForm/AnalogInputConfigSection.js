// @flow

import * as React from 'react'
import {withRouter, Link} from 'react-router-dom'
import {TextField} from 'redux-form-material-ui'
import {Field} from 'redux-form'

import ControlWithInfo from '../../components/ControlWithInfo'
import DrilldownButton from '../../components/DrilldownButton'
import {CALIBRATION} from '../../react-router/routePaths'

export type Props = {
  formControlClass: string,
  firstControlClass: string,
  lastControlClass: string,
  match: {
    url: string,
  },
}

const AnalogInputConfigSection = withRouter(
  ({formControlClass, firstControlClass, lastControlClass, match}: Props) => (
    <React.Fragment>
      <ControlWithInfo info="The units for the system value" className={firstControlClass}>
        <Field
          name="config.units"
          label="Units"
          type="text"
          component={TextField}
          className={formControlClass}
        />
      </ControlWithInfo>
      <ControlWithInfo info="The number of digits to show after the decimal place" className={firstControlClass}>
        <Field
          name="config.precision"
          label="Precision"
          type="text"
          component={TextField}
          className={formControlClass}
        />
      </ControlWithInfo>
      <ControlWithInfo info="Takes you to the calibration wizard" className={lastControlClass}>
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
)

export default AnalogInputConfigSection

