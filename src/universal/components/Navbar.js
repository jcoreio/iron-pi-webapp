// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'

import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import IconButton from 'material-ui/IconButton'
import MenuIcon from 'material-ui-icons/Menu'

const styles = {
  root: {
    width: '100%',
  },
  menuButton: {
    marginLeft: -20,
  },
}

export type Props = {
  classes: {[name: $Keys<typeof styles>]: string},
  onToggleSidebar?: () => any,
}

class Navbar extends React.Component<Props> {
  render(): ?React.Node {
    const {classes, onToggleSidebar} = this.props
    return (
      <div id="navbar" className={classes.root}>
        <AppBar position="static" color="default">
          <Toolbar>
            <IconButton
              id="toggleSidebarButton"
              aria-label="toggle sidebar"
              onClick={onToggleSidebar}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <Typography type="title" color="inherit">
              Title
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}

export default withStyles(styles)(Navbar)

