// @flow

import * as React from 'react'
import classNames from 'classnames'
import {Field} from 'redux-form-normalize-on-blur'
import ControlWithInfo from '../../components/ControlWithInfo'
import TextField from '../../components/TextField'

export type Props = {
  formControlClass: string,
  firstControlClass: string,
  lastControlClass: string,
}

const trim = (value: ?string) => value && value.trim()

const DisabledConfigSection = ({formControlClass, firstControlClass, lastControlClass}: Props) => (
  <React.Fragment>
    <ControlWithInfo info="Display name for this channel">
      <Field
        name="metadataItem.name"
        label="Name"
        type="text"
        component={TextField}
        className={classNames(formControlClass, firstControlClass, lastControlClass)}
        normalizeOnBlur={trim}
      />
    </ControlWithInfo>
  </React.Fragment>
)


export default DisabledConfigSection

