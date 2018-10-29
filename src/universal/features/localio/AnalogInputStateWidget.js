// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles, withTheme} from '@material-ui/core/styles'
import Arrow from 'react-arrow'

import ValueBlock from '../../components/ValueBlock'

import type {Theme} from '../../theme'
import CalibrationIcon from '../../components/icons/CalibrationIcon'
import type {AnalogInputState} from '../../localio/LocalIOChannel'

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

const CalibrationBlockStyles = ({palette, spacing, channelState: {block}}: Theme) => ({
  block: {
    border: {
      width: 1,
      style: 'solid',
      color: palette.grey[400],
    },
    backgroundColor: palette.grey[100],
    padding: block.padding,
  },
  title: {
    margin: 0,
    textAlign: 'center',
    fontSize: '0.875rem',
    fontWeight: 400,
    color: palette.grey[600],
  },
  icon: {
    color: palette.grey[700],
    display: 'block',
    margin: '0 auto',
  }
})

type CalibrationBlockClasses = $Call<ExtractClasses, typeof CalibrationBlockStyles>

export type CalibrationBlockProps = {
  classes: CalibrationBlockClasses,
  className?: string,
}

const CalibrationBlock = withStyles(CalibrationBlockStyles, {withTheme: true})(
  ({classes, className}: CalibrationBlockProps) => (
    <div className={classNames(classes.block, className)}>
      <h4 className={classes.title}>
        Calibration
      </h4>
      <CalibrationIcon className={classes.icon} />
    </div>
  )
)

const styles = ({palette, spacing, channelState: {block}}: Theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrow: {
    margin: spacing.unit,
  },
  block: {
    height: block.height,
    minWidth: spacing.unit * 12,
  },
  valueBlock: {
    flexGrow: 1,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  className?: string,
  channel?: {
    metadataItem?: {
      units?: string,
      displayPrecision?: number,
    },
    state?: AnalogInputState,
  },
}

const AnalogInputStateWidget = withStyles(styles, {withTheme: true})(
  ({classes, className, channel}: Props) => {
    const finalChannel = channel || {}
    const metadataItem = finalChannel.metadataItem || {}
    const {state} = finalChannel
    const {units} = metadataItem
    const precision = metadataItem.displayPrecision || 0
    const {rawInput, systemValue} = state || {}
    return (
      <div className={classNames(classes.root, className)} data-component="AnalogInputStateWidget">
        <ValueBlock
          className={classNames(classes.block, classes.valueBlock)}
          data-test-name="rawInput"
          title="Raw Input"
          value={rawInput}
          precision={2}
          units="V"
        />
        <FlowArrow className={classes.arrow} />
        <CalibrationBlock className={classes.block} />
        <FlowArrow className={classes.arrow} />
        <ValueBlock
          className={classNames(classes.block, classes.valueBlock)}
          data-test-name="systemValue"
          title="System Value"
          value={systemValue}
          precision={precision}
          units={units}
        />
      </div>
    )
  }
)

export default AnalogInputStateWidget

