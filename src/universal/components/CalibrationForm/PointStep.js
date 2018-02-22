// @flow

import * as React from 'react'
import classNames from 'classnames'
import {Field} from 'redux-form'
import {withStyles, withTheme} from 'material-ui/styles'
import {required} from '@jcoreio/redux-form-validators/lib/index'
import {NumericField} from 'redux-form-numeric-field'
import {TransitionListener} from 'react-transition-context'
import Arrow from 'react-arrow'

import type {Theme} from '../../theme/index'
import TextField from '../TextField'
import ValueBlock from '../ValueBlock'

const FlowArrow = withTheme()(({theme: {channelState: {arrow}}, ...props}: Object) => (
  <Arrow
    direction="right"
    shaftWidth={arrow.shaftWidth}
    shaftLength={arrow.shaftLength}
    headWidth={arrow.headWidth}
    headLength={arrow.headLength}
    fill={arrow.fill}
    {...props}
  />
))

export type ValueBlockFieldProps = {
  input: {
    value: any,
  },
  meta: {
    error?: string,
  },
  precision: number,
}

const ValueBlockField = ({input, meta, precision, ...props}: ValueBlockFieldProps): React.Node => (
  <ValueBlock
    value={input.value != null && Number.isFinite(input.value)
      ? input.value.toFixed(precision)
      : input.value}
    error={meta.error}
    {...props}
  />
)

const styles = ({spacing, palette, overrides}: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  block: {
    border: {
      width: 1,
      style: 'solid',
      color: palette.grey[300],
    },
    padding: `${spacing.unit}px ${spacing.unit * 3}px`,
    height: 76,
    flexGrow: 1,
  },
  actualValueBlock: {
    display: 'inline-flex',
    alignItems: 'baseline',
  },
  actualValueField: {
    flex: '1 1 75px',
  },
  arrow: {
    margin: spacing.unit,
  },
  units: {
    marginLeft: spacing.unit,
    color: palette.text.primary,
    fontSize: overrides.MuiInput.root.fontSize,
    fontWeight: overrides.MuiInput.root.fontWeight,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  bodyClass: string,
  pointIndex: number,
  change: (field: string, newValue: any) => void,
  units?: string,
  rawInput?: ?number,
  rawInputUnits: string,
  rawInputPrecision?: ?number,
}

class PointStep extends React.Component<Props> {
  actualValueInput: ?HTMLInputElement = null

  handleCameIn = () => {
    const {actualValueInput} = this
    if (actualValueInput) {
      actualValueInput.focus()
      actualValueInput.select()
    }
  }

  updateX = (props: Props = this.props) => {
    const {rawInput, change, pointIndex} = props
    change(`points[${pointIndex}].x`, rawInput)
  }

  componentDidMount() {
    this.updateX()
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.rawInput !== nextProps.rawInput) {
      this.updateX(nextProps)
    }
  }

  render(): ?React.Node {
    const {classes, bodyClass, pointIndex, rawInputUnits, rawInputPrecision, units} = this.props
    return (
      <div className={classNames(bodyClass, classes.root)}>
        <Field
          name={`points[${pointIndex}].x`}
          title="Raw Input"
          units={rawInputUnits}
          className={classes.block}
          component={ValueBlockField}
          validate={required()}
          precision={rawInputPrecision != null ? rawInputPrecision : 2}
        />
        <FlowArrow className={classes.arrow} />
        <div className={classNames(classes.block, classes.actualValueBlock)}>
          <NumericField
            className={classes.actualValueField}
            name={`points[${pointIndex}].y`}
            label="Actual Value"
            component={TextField}
            validate={required()}
            inputRef={c => this.actualValueInput = c}
          />
          <span className={classes.units}>{units}</span>
        </div>
        <TransitionListener didComeIn={this.handleCameIn} />
      </div>
    )
  }
}

export default withStyles(styles, {withTheme: true})(PointStep)

