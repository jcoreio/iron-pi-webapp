// @flow

import * as React from 'react'
import {withRouter, Link} from 'react-router-dom'

import ControlWithInfo from '../../components/ControlWithInfo'
import DrilldownButton from '../../components/DrilldownButton'
import {CALIBRATION} from './routePaths'

export type Props = {
  formControlClass: string,
  firstControlClass: string,
  lastControlClass: string,
  match: {
    url: string,
  },
}

const AnalogInputConfigSection = ({formControlClass, firstControlClass, lastControlClass, match}: Props) => (
  <React.Fragment>
    <ControlWithInfo
      info="The calibration allows you to enter a linear conversion between the Raw Input and the System Value"
      className={lastControlClass}
    >
      <DrilldownButton
        className={formControlClass}
        component={Link}
        variant="raised"
        to={`${match.url}/${CALIBRATION}`}
      >
        Calibration
      </DrilldownButton>
    </ControlWithInfo>
  </React.Fragment>
)


export default withRouter(AnalogInputConfigSection)

