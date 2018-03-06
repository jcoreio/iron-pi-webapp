// @flow

import * as React from 'react'
import Collapse from 'material-ui/transitions/Collapse'
import {Field, FieldArray, formValues} from 'redux-form'

import ControlWithInfo from '../../components/ControlWithInfo'
import ButtonGroupField from '../../components/ButtonGroupField'
import {ControlModesArray, getControlModeDisplayText} from '../../localio/LocalIOChannel'
import ControlLogicTable from './ControlLogicTable'
import {required} from 'redux-form-validators'
import type {ControlMode} from '../../localio/LocalIOChannel'

type MetadataItem = {
  tag: string,
  name: string,
}

export type Props = {
  formControlClass: string,
  firstControlClass: string,
  lastControlClass: string,
  tallButtonClass: string,
  "config.controlMode"?: ControlMode,
  metadata?: Array<MetadataItem>,
  change: (field: string, newValue: any) => any,
}

const controlModeInfo = (
  <span>
    <p><strong>Force Off</strong>: Forces the output to an off state</p>
    <p><strong>Force On</strong>: Forces the output to an on state</p>
    <p><strong>Local Control</strong>: Controls the output based on a condition defined in the Control Logic section</p>
    <p><strong>Remote Control</strong>: Controls the output based on remote MQTT commands. The mapping between MQTT and the channel must be configured in the MQTT section.</p>
  </span>
)

const PolarityAndSafeStateInfo = ({controlMode}: {controlMode?: ControlMode}) => (
  <span>
    {controlMode === 'LOCAL_CONTROL' &&
      <p><strong>Safe State</strong>: State of the output when inputs of the control logic are unavailable</p>
    }
    {controlMode === 'REMOTE_CONTROL' &&
      <p><strong>Safe State</strong>: State of the output when the remote control connection is offline</p>
    }
    <p>
      <strong>Polarity</strong>: Optionally inverts the logic level of the input:
      <ul>
        <li>
          <strong>Normal</strong>: Logic level is not inverted
        </li>
        <li>
          <strong>Reversed</strong>: Logic level is inverted
        </li>
      </ul>
    </p>
  </span>
)

const DigitalOutputConfigSection = (
  ({
    formControlClass, firstControlClass, lastControlClass, tallButtonClass, metadata, change,
    "config.controlMode": controlMode
  }: Props) => (
    <React.Fragment>
      <ControlWithInfo info={controlModeInfo} className={firstControlClass}>
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
          metadata={metadata}
          change={change}
          formControlClass={formControlClass}
          validate={required()}
        />
      </Collapse>
      <ControlWithInfo info={<PolarityAndSafeStateInfo controlMode={controlMode} />} className={lastControlClass}>
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

