// @flow

import * as React from 'react'
import Drawer from 'material-ui/Drawer'
import {withStyles} from 'material-ui/styles'

const hPadding = 22
const vPadding = 10
const drawerWidth = 240

const styles = theme => ({
  drawerPaper: {
    position: 'relative',
    backgroundColor: theme.sidebarBackgroundColor,
    color: theme.sidebarForegroundColor,
    height: '100%',
    width: drawerWidth,
  },
  drawerHeader: {
    borderBottomWidth: 3,
    borderBottomStyle: 'solid',
    borderBottomColor: theme.jcorePrimaryColor,
    padding: `${vPadding}px ${hPadding}px`,
    fontFamily: 'Rubik',
    fontWeight: 300,
  },
  jcoreHeader: {
    color: theme.jcorePrimaryColor,
    fontSize: 32,
    lineHeight: '38px',
    fontWeight: 300,
    margin: 0,
  },
  ironPiHeader: {
    fontSize: 22,
    lineHeight: '27px',
    fontWeight: 300,
    margin: 0,
  }
})

export type Props = {
  open: boolean,
  classes: Object,
}

class Sidebar extends React.Component<Props> {
  static defaultProps: {
    open: boolean,
  } = {
    open: false,
  }
  render(): ?React.Node {
    const {open, classes} = this.props
    return (
      <Drawer open={open} type="persistent" anchor="left" classes={{paper: classes.drawerPaper}}>
        <div className={classes.drawerHeader}>
          <h1 className={classes.jcoreHeader}>jcore.io</h1>
          <h2 className={classes.ironPiHeader}>IRON PI</h2>
        </div>
      </Drawer>
    )
  }
}

export default withStyles(styles, {withTheme: true})(Sidebar)
