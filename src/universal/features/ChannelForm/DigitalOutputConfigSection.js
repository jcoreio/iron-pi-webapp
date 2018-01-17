// @flow

import * as React from 'react'
import Collapse from 'material-ui/transitions/Collapse'
import {Field, FieldArray, formValues} from 'redux-form'

import ControlWithInfo from '../../components/ControlWithInfo'
import ButtonGroupField from '../../components/ButtonGroupField'
import {ControlModesArray, getControlModeDisplayText} from '../../types/Channel'
import ControlLogicTable from './ControlLogicTable'
import {required} from '@jcoreio/redux-form-validators'
import type {ControlMode} from '../../types/Channel'

type Channel = {
  id: number,
  name: string,
}

export type Props = {
  formControlClass: string,
  firstControlClass: string,
  lastControlClass: string,
  tallButtonClass: string,
  "config.controlMode"?: ControlMode,
  channels?: Array<Channel>,
}

const DigitalOutputConfigSection = (
  ({
    formControlClass, firstControlClass, lastControlClass, tallButtonClass, channels,
    "config.controlMode": controlMode
  }: Props) => (
    <React.Fragment>
      <ControlWithInfo info="How this output is controlled" className={firstControlClass}>
        <Field
          name="config.controlMode"
          component={ButtonGroupField}
          className={formControlClass}
          buttonClassName={tallButtonClass}
          availableValues={ControlModesArray}
          getDisplayText={getControlModeDisplayText}
          validate={required()}
        />
      </ControlWithInfo>
      <Collapse in={controlMode === 'LOCAL_CONTROL'} unmountOnExit>
        <FieldArray
          name="config.controlLogic"
          component={ControlLogicTable}
          channels={channels}
          formControlClass={formControlClass}
          validate={required()}
        />
      </Collapse>
      <ControlWithInfo info="????" className={lastControlClass}>
        <Field
          name="config.safeState"
          label="Safe State"
          component={ButtonGroupField}
          className={formControlClass}
          buttonClassName={tallButtonClass}
          availableValues={[0, 1]}
          getDisplayText={value => value ? 'Output On' : 'Output Off'}
          validate={required()}
        />
        <Field
          name="config.reversePolarity"
          label="Polarity"
          component={ButtonGroupField}
          className={formControlClass}
          buttonClassName={tallButtonClass}
          availableValues={[false, true]}
          getDisplayText={value => value ? 'Reversed' : 'Normal'}
          validate={required()}
        />
      </ControlWithInfo>
    </React.Fragment>
  )
)

export default formValues('config.controlMode')(DigitalOutputConfigSection)

