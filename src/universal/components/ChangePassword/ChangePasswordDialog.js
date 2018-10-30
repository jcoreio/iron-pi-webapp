// @flow

import * as React from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import {withStyles} from '@material-ui/core/styles'
import type {Theme} from '../../theme'

const styles = ({palette, jcoreLogo, ironPiLogo, spacing}: Theme) => ({
  paper: {
    borderRadius: 0,
  },
  title: {
    borderBottom: {
      style: 'solid',
      width: 3,
      color: palette.text.primary,
    },
    fontFamily: 'Rubik',
    fontWeight: 300,
    padding: `${spacing.unit * 1.5}px ${spacing.unit * 3}px`,
  },
  backdrop: {
    backgroundColor: palette.background.opaqueBackdrop,
  },
  content: {
    maxWidth: 347,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  children: React.Node,
}

const ChangePasswordDialog = ({classes, children, theme, ...props}: Props) => (
  <Dialog
    id="changePasswordDialog"
    aria-labelledby="changePasswordDialogTitle"
    classes={{paper: classes.paper}}
    {...props}
    BackdropProps={{
      classes: {root: classes.backdrop},
    }}
  >
    <DialogTitle id="changePasswordDialogTitle" className={classes.title}>
      Change Password
    </DialogTitle>
    <DialogContent className={classes.content}>
      {children}
    </DialogContent>
  </Dialog>
)

export default withStyles(styles, {withTheme: true})(ChangePasswordDialog)


