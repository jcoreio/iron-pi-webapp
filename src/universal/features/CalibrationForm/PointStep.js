// @flow

import * as React from 'react'
import classNames from 'classnames'
import {Field} from 'redux-form'
import {withStyles, withTheme} from 'material-ui/styles'
import {required} from '@jcoreio/redux-form-validators/lib/index'
import {NumericField} from 'redux-form-numeric-field'
import {TransitionListener} from 'react-transition-context'
import Arrow from 'react-arrow'

import type {Theme} from '../../theme'
import TextField from '../../components/TextField'
import ValueBlock from '../../components/ValueBlock'

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
}

const ValueBlockField = ({input, meta, ...props}: ValueBlockFieldProps): React.Node => (
  <ValueBlock
    value={input.value}
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
  channel?: {
    config: {
      units?: string,
    },
    state?: {
      rawInput?: number,
    },
  },
}

function getRawInput(channel: ?{state?: {rawInput?: number}}): ?number {
  const {rawInput} = channel && channel.state || {}
  return rawInput
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
    const {channel, change, pointIndex} = props
    const rawInput = getRawInput(channel)
    change(`points[${pointIndex}].x`, rawInput)
  }

  componentDidMount() {
    this.updateX()
  }

  componentWillReceiveProps(nextProps: Props) {
    if (getRawInput(this.props.channel) !== getRawInput(nextProps.channel)) {
      this.updateX(nextProps)
    }
  }

  render(): ?React.Node {
    const {classes, bodyClass, pointIndex, channel} = this.props
    const {config: {units}} = channel || {config: {}}
    return (
      <div className={classNames(bodyClass, classes.root)}>
        <Field
          name={`points[${pointIndex}].x`}
          title="Raw Input"
          units="V"
          className={classes.block}
          component={ValueBlockField}
          validate={required()}
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

