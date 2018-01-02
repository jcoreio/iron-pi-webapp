// @flow

import * as React from 'react'
import Dialog, {DialogTitle, DialogContent} from 'material-ui/Dialog'
import {withStyles} from 'material-ui/styles'
import type {Theme} from '../../theme'

const styles = (theme: Theme) => ({
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  children: React.Node,
}

const LoginDialog = withStyles(styles, {withTheme: true})(
  ({classes, children, ...props}: Props) => (
    <Dialog id="loginDialog" aria-labelledby="loginDialogTitle" {...props}>
      <DialogTitle id="loginDialogTitle">Log In</DialogTitle>
      <DialogContent>
        {children}
      </DialogContent>
    </Dialog>
  )
)

export default LoginDialog


