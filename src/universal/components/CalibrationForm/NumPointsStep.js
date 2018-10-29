// @flow

import * as React from 'react'
import {withStyles} from '@material-ui/core/styles'
import {numericality} from 'redux-form-validators'
import TextField from '../TextField'
import {NumericField} from 'redux-form-numeric-field'
import {TransitionListener} from 'react-transition-context'

import type {Theme} from '../../theme/index'

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
  numPointsInput: ?HTMLInputElement = null

  handleCameIn = () => {
    const {numPointsInput} = this
    if (numPointsInput) {
      numPointsInput.focus()
      numPointsInput.select()
    }
  }

  render(): ?React.Node {
    const {classes, bodyClass} = this.props
    return (
      <div className={bodyClass}>
        <NumericField
          name="numPoints"
          label="How many calibration points do you want to enter?"
          component={TextField}
          className={classes.numPointsField}
          validate={numericality({int: true, '>=': 2, '<=': 10})}
          inputRef={c => this.numPointsInput = c}
        />
        <TransitionListener didComeIn={this.handleCameIn} />
      </div>
    )
  }
}

export default withStyles(styles, {withTheme: true})(BeginStep)

