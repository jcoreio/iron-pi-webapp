// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'
import {numericality, required} from '@jcoreio/redux-form-validators/lib/index'
import {TextField} from 'redux-form-material-ui'
import {NumericField} from 'redux-form-numeric-field'
import {TransitionListener} from 'react-transition-context'

import type {Theme} from '../../theme'

const styles = (theme: Theme) => ({
  numPointsField: {
    width: '100%',
  }
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  bodyClass: string,
}

class BeginStep extends React.Component<Props> {
  numStepsInput: ?HTMLInputElement = null

  handleCameIn = () => {
    const {numStepsInput} = this
    if (numStepsInput) {
      numStepsInput.focus()
      numStepsInput.select()
    }
  }

  render(): ?React.Node {
    const {classes, bodyClass} = this.props
    return (
      <div className={bodyClass}>
        <NumericField
          name="numSteps"
          label="How many calibration points do you want to enter?"
          component={TextField}
          className={classes.numPointsField}
          validate={[required(), numericality({int: true, '>=': 2, '<=': 10})]}
          inputRef={c => this.numStepsInput = c}
        />
        <TransitionListener didComeIn={this.handleCameIn} />
      </div>
    )
  }
}

export default withStyles(styles, {withTheme: true})(BeginStep)

