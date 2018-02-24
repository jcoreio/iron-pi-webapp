// @flow

import * as React from 'react'
import Dialog, {DialogTitle, DialogContent} from 'material-ui/Dialog'
import {withStyles} from 'material-ui/styles'
import type {Theme} from '../../theme'

const styles = ({palette, jcoreLogo, ironPiLogo, spacing}: Theme) => ({
  paper: {
    borderRadius: 0,
  },
  title: {
    backgroundColor: palette.background.loginDialog.header,
    borderBottom: {
      style: 'solid',
      width: 3,
      color: palette.secondary[500],
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
  jcoreLogo: {
    ...jcoreLogo,
    margin: 0,
  },
  ironPiLogo: {
    ...ironPiLogo,
    margin: 0,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  children: React.Node,
}

const LoginDialog = ({classes, children, theme, ...props}: Props) => (
  <Dialog
    id="loginDialog"
    aria-labelledby="loginDialogTitle"
    classes={{paper: classes.paper}}
    {...props}
    BackdropProps={{
      classes: {root: classes.backdrop},
    }}
  >
    <DialogTitle id="loginDialogTitle" className={classes.title}>
      <div className={classes.jcoreLogo}>jcore.io</div>
      <div className={classes.ironPiLogo}>iron pi</div>
    </DialogTitle>
    <DialogContent className={classes.content}>
      {children}
    </DialogContent>
  </Dialog>
)

export default withStyles(styles, {withTheme: true})(LoginDialog)


