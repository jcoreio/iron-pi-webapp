// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles} from 'material-ui/styles'
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
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  className?: string,
  title: React.Node,
  value?: React.Node,
  units?: React.Node,
}

const ValueBlock = withStyles(styles, {withTheme: true})(
  ({classes, className, title, value, units}: Props) => (
    <div className={classNames(classes.block, className)}>
      <h4 className={classes.title}>
        {title}
      </h4>
      <span className={classes.value}>
        {value}
      </span>
      <span className={classes.units}>
        {units}
      </span>
    </div>
  )
)

export default ValueBlock
