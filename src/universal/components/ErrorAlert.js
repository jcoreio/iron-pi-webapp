// @flow

import * as React from 'react'
import {withStyles} from '@material-ui/core/styles'
import ErrorIcon from '@material-ui/icons/Error'
import type {Theme} from '../../universal/theme'

const styles = ({palette, spacing}: Theme) => ({
  root: {
    color: palette.error.A400,
    display: 'flex',
    alignItems: 'center',
  },
  errorIcon: {
    marginRight: spacing.unit,
  },
  errorMessage: {
    flexGrow: 1,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  children: React.Node,
}

const ErrorAlert = ({classes, children, theme, ...props}: Props) => (
  <div className={classes.root} {...props} data-component="ErrorAlert">
    <ErrorIcon className={classes.errorIcon} />
    <span className={classes.errorMessage}>{children}</span>
  </div>
)

export default withStyles(styles, {withTheme: true})(ErrorAlert)
