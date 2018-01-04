// @flow

import * as React from 'react'
import classNames from 'classnames'
import {Field} from 'redux-form'
import {withStyles, withTheme} from 'material-ui/styles'
import IconButton from 'material-ui/IconButton'
import Positive from 'material-ui-icons/AddCircleOutline'
import Negative from 'material-ui-icons/RemoveCircleOutline'
import Arrow from 'react-arrow'

import ValueBlock from './ValueBlock'

import type {Theme} from '../../theme'

const FlowArrow = withTheme()(({theme: {spacing, palette}, ...props}: Object) => (
  <Arrow
    direction="right"
    shaftWidth={spacing.unit * 1.5}
    shaftLength={spacing.unit * 6}
    headWidth={spacing.unit * 2.1}
    headLength={spacing.unit * 1.7}
    fill={palette.primary.A100}
    {...props}
  />
))

const polaritySectionStyles = ({palette}: Theme) => ({
  root: {
    position: 'relative',
  },
  title: {
    position: 'absolute',
    top: 0,
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
  input: {
    value?: boolean,
    onChange: (newValue: boolean) => any,
  },
}

const PolaritySection = withStyles(polaritySectionStyles, {withTheme: true})(
  ({classes, input: {value, onChange}}: PolaritySectionProps) => (
    <div className={classes.root}>
      <h4 className={classes.title}>
        Polarity
      </h4>
      <IconButton className={classes.icon} onClick={() => onChange(!value)}>
        {value
          ? <Negative />
          : <Positive />
        }
      </IconButton>
    </div>
  )
)

const styles = ({palette, spacing}: Theme) => ({
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
    height: spacing.unit * 6,
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
  rawValue?: number,
  systemValue?: number,
}

const DigitalInputState = (
  ({classes, className, rawValue, systemValue}: Props) => (
    <div className={classNames(classes.root, className)}>
      <ValueBlock
        className={classNames(classes.block, classes.valueBlock)}
        title="Raw Input"
        value={rawValue != null && Number.isFinite(rawValue) ? rawValue.toFixed(0) : null}
      />
      <FlowArrow className={classes.arrow} />
      <Field
        name="config.reversePolarity"
        component={PolaritySection}
      />
      <FlowArrow className={classes.arrow} />
      <ValueBlock
        className={classNames(classes.block, classes.valueBlock)}
        title="System Value"
        value={systemValue != null && Number.isFinite(systemValue) ? systemValue.toFixed(0) : null}
      />
    </div>
  )
)

export default withStyles(styles, {withTheme: true})(DigitalInputState)

