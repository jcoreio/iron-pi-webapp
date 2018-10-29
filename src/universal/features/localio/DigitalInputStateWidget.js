// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles, withTheme} from '@material-ui/core/styles'
import Positive from '@material-ui/icons/AddCircle'
import Negative from '@material-ui/icons/RemoveCircle'
import Arrow from 'react-arrow'

import ValueBlock from '../../components/ValueBlock'

import type {Theme} from '../../theme'
import type {DigitalInputState} from '../../localio/LocalIOChannel'

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

const polaritySectionStyles = ({palette, channelState: {polarityIcon}}: Theme) => ({
  root: {
    position: 'relative',
    overflow: 'visible',
  },
  title: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translate(-50%, -100%)',
    margin: 0,
    fontSize: '1rem',
    fontWeight: 400,
    color: palette.grey[600],
  },
  icon: {
    ...polarityIcon,
    display: 'block',
    margin: '0 auto',
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
        ? <Negative className={classes.icon} />
        : <Positive className={classes.icon} />
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
      <div className={classNames(classes.root, className)} data-component="DigitalInputStateWidget">
        <ValueBlock
          className={classNames(classes.block, classes.valueBlock)}
          data-test-name="rawInput"
          title="Raw Input"
          value={rawInput}
          precision={0}
        />
        <FlowArrow className={classes.arrow} />
        <PolaritySection reversePolarity={reversePolarity} />
        <FlowArrow className={classes.arrow} />
        <ValueBlock
          className={classNames(classes.block, classes.valueBlock)}
          data-test-name="systemValue"
          title="System Value"
          value={systemValue}
          precision={0}
        />
      </div>
    )
  }
)

export default withStyles(styles, {withTheme: true})(DigitalInputStateWidget)

