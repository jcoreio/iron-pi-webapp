// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles} from '@material-ui/core/styles'
import FormHelperText from '@material-ui/core/FormHelperText'
import type {Theme} from '../theme/index'

const styles = ({palette, spacing, channelState: {block}}: Theme) => ({
  block: {
    border: {
      width: 1,
      style: 'solid',
      color: palette.grey[300],
    },
    backgroundColor: palette.background.valueBlock.ok,
    display: 'inline-flex',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    padding: block.padding,
  },
  error: {
    border: {
      width: 1,
      style: 'solid',
      color: palette.error.main,
    },
    '& $title, & $value, & $units, & $helperText': {
      color: palette.error.main,
    },
  },
  title: {
    margin: 0,
    flex: '1 0 100%',
    textAlign: 'center',
    color: palette.grey[600],
    fontWeight: 400,
    fontSize: '1.06rem',
  },
  value: {
    textAlign: 'right',
    color: palette.grey[600],
    fontSize: '1.5rem',
  },
  units: {
    marginLeft: spacing.unit,
    color: palette.grey[600],
    fontSize: '1rem',
  },
  helperText: {
    flex: '1 0 100%',
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  className?: string,
  title?: React.Node,
  value?: React.Node,
  units?: React.Node,
  error?: React.Node,
  precision?: number,
}

export function formatValue(value: ?React.Node, precision: ?number): ?React.Node {
  if (precision == null || !Number.isFinite(precision)) precision = 1
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toFixed(precision) : 'NA'
  }
  if (value == null) return 'NA'
  return value
}

const ValueBlock = ({classes, className, title, value, precision, units, theme, error, ...props}: Props) => (
  <div className={classNames(classes.block, {[classes.error]: error}, className)} data-component="ValueBlock" {...props}>
    {title ? <h4 className={classes.title} data-test-name="title">{title}</h4> : null}
    <span className={classes.value} data-test-name="value">
      {formatValue(value, precision)}
    </span>
    {units &&
      <span className={classes.units} data-test-name="units">
        {units}
      </span>
    }
    {error && <FormHelperText className={classes.helperText} data-component="FormHelperText">{error}</FormHelperText>}
  </div>
)

export default withStyles(styles, {withTheme: true})(ValueBlock)
