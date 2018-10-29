// @flow

import * as React from 'react'
import {withStyles} from '@material-ui/core/styles'
import Check from 'material-ui-icons/Check'
import type {Theme} from '../../universal/theme'

const styles = ({palette, spacing}: Theme) => ({
  root: {
    color: palette.success.main,
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.unit,
  },
  message: {
    flexGrow: 1,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  children: React.Node,
}

const SuccessAlert = ({classes, children, theme, ...props}: Props) => (
  <div className={classes.root} {...props} data-component="SuccessAlert">
    <Check className={classes.icon} />
    <span className={classes.message}>{children}</span>
  </div>
)

export default withStyles(styles, {withTheme: true})(SuccessAlert)
