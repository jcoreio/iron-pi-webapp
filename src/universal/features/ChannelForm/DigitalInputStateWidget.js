// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles, withTheme} from 'material-ui/styles'
import Positive from 'material-ui-icons/AddCircleOutline'
import Negative from 'material-ui-icons/RemoveCircleOutline'
import Arrow from 'react-arrow'

import ValueBlock from './ValueBlock'

import type {Theme} from '../../theme'
import type {DigitalInputState} from '../../types/Channel'

const FlowArrow = withTheme()(({theme: {channelState: {arrow}}, ...props}: Object) => (
  <Arrow
    direction="right"
    shaftWidth={arrow.shaftWidth}
    shaftLength={arrow.longShaftLength}
    headWidth={arrow.headWidth}
    headLength={arrow.headLength}
    fill={arrow.fill}
    {...props}
  />
))

const polaritySectionStyles = ({palette, spacing}: Theme) => ({
  root: {
    position: 'relative',
  },
  title: {
    position: 'absolute',
    top: spacing.unit,
    transform: 'translateY(-100%)',
    margin: 0,
    fontSize: '1rem',
    fontWeight: 400,
    color: palette.grey[600],
  },
  icon: {
    color: palette.grey[600],
    display: 'block',
    margin: '0 auto',
    fontSize: '2.5rem',
  }
})

type PolaritySectionClasses = $Call<ExtractClasses, typeof polaritySectionStyles>

export type PolaritySectionProps = {
  classes: PolaritySectionClasses,
  reversePolarity?: boolean,
}

const PolaritySection = withStyles(polaritySectionStyles, {withTheme: true})(
  ({classes, reversePolarity}: PolaritySectionProps) => (
    <div className={classes.root}>
      <h4 className={classes.title}>
        Polarity
      </h4>
      {reversePolarity
        ? <Negative />
        : <Positive />
      }
    </div>
  )
)

const styles = ({spacing, channelState: {block}}: Theme) => ({
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
    state?: DigitalInputState,
  },
}

const DigitalInputStateWidget = (
  ({classes, className, channel}: Props) => {
    const {state} = channel || {state: null}
    const {rawInput, reversePolarity, systemValue} = state || {}
    return (
      <div className={classNames(classes.root, className)}>
        <ValueBlock
          className={classNames(classes.block, classes.valueBlock)}
          title="Raw Input"
          value={rawInput != null && Number.isFinite(rawInput) ? rawInput.toFixed(0) : null}
        />
        <FlowArrow className={classes.arrow} />
        <PolaritySection reversePolarity={reversePolarity} />
        <FlowArrow className={classes.arrow} />
        <ValueBlock
          className={classNames(classes.block, classes.valueBlock)}
          title="System Value"
          value={systemValue != null && Number.isFinite(systemValue) ? systemValue.toFixed(0) : null}
        />
      </div>
    )
  }
)

export default withStyles(styles, {withTheme: true})(DigitalInputStateWidget)

