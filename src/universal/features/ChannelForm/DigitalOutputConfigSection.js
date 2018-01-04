// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles} from 'material-ui/styles'
import {Field, FieldArray} from 'redux-form'

import type {Theme} from '../../theme'
import ControlWithInfo from '../../components/ControlWithInfo'
import ButtonGroupField from '../../components/ButtonGroupField'
import {ControlModesArray, getControlModeDisplayText} from '../../types/Channel'
import ControlLogicTable from './ControlLogicTable'

const styles = ({spacing}: Theme) => ({
  safeStateOutputOnField: {
    marginRight: spacing.unit,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

type Channel = {
  id: number,
  name: string,
}

export type Props = {
  classes: Classes,
  formControlClass: string,
  firstControlClass: string,
  lastControlClass: string,
  tallButtonClass: string,
  channels?: Array<Channel>,
}

const DigitalOutputConfigSection = withStyles(styles, {withTheme: true})(
  ({formControlClass, firstControlClass, lastControlClass, tallButtonClass, classes, channels}: Props) => (
    <React.Fragment>
      <ControlWithInfo info="How this output is controlled" className={firstControlClass}>
        <Field
          name="config.controlMode"
          component={ButtonGroupField}
          className={formControlClass}
          buttonClassName={tallButtonClass}
          availableValues={ControlModesArray}
          getDisplayText={getControlModeDisplayText}
        />
      </ControlWithInfo>
      <FieldArray
        name="config.controlLogic"
        component={ControlLogicTable}
        channels={channels}
      />
      <ControlWithInfo info="????" className={lastControlClass}>
        <Field
          name="config.safeStateOutputOn"
          label="Safe State"
          component={ButtonGroupField}
          className={classNames(formControlClass, classes.safeStateOutputOnField)}
          buttonClassName={tallButtonClass}
          availableValues={[false, true]}
          getDisplayText={value => value ? 'Output On' : 'Output Off'}
        />
        <Field
          name="config.reversePolarity"
          label="Polarity"
          component={ButtonGroupField}
          className={formControlClass}
          buttonClassName={tallButtonClass}
          availableValues={[false, true]}
          getDisplayText={value => value ? 'Reversed' : 'Normal'}
        />
      </ControlWithInfo>
    </React.Fragment>
  )
)

export default DigitalOutputConfigSection

