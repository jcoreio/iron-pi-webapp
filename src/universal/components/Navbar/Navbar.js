// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'

import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import Typography from 'material-ui/Typography'
import IconButton from 'material-ui/IconButton'
import MenuIcon from 'material-ui-icons/Menu'
import AccountCircle from 'material-ui-icons/AccountCircle'
import Menu, { MenuItem } from 'material-ui/Menu'

const styles = {
  root: {
    width: '100%',
  },
  toolbar: {
    padding: 0,
  },
  menuButton: {
  },
  title: {
    flex: 1,
  },
}

export type Props = {
  classes: {[name: $Keys<typeof styles>]: string},
  onToggleSidebar?: () => any,
  loggedIn?: boolean,
}

export type State = {
  userMenuAnchorEl: ?HTMLElement,
}

class Navbar extends React.Component<Props, State> {
  state: State = {
    userMenuAnchorEl: null,
  }
  handleOpenUserMenu = (event: MouseEvent) => {
    this.setState({userMenuAnchorEl: (event.currentTarget: any)})
  }
  handleCloseUserMenu = () => {
    this.setState({userMenuAnchorEl: null})
  }
  render(): ?React.Node {
    const {classes, onToggleSidebar, loggedIn} = this.props
    const {userMenuAnchorEl} = this.state
    return (
      <div id="navbar" className={classes.root}>
        <AppBar position="static" color="default">
          <Toolbar className={classes.toolbar}>
            <IconButton
              id="toggleSidebarButton"
              aria-label="toggle sidebar"
              onClick={onToggleSidebar}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <Typography type="title" color="inherit" className={classes.title}>
              Title
            </Typography>
            <IconButton
              id="openUserMenuButton"
              aria-label="open user menu"
              aria-owns={userMenuAnchorEl != null ? "userMenu" : null}
              aria-haspopup="true"
              onClick={this.handleOpenUserMenu}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="userMenu"
              anchorEl={userMenuAnchorEl}
              open={userMenuAnchorEl != null}
              onClose={this.handleCloseUserMenu}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {!loggedIn && <MenuItem>Log in</MenuItem>}
              {loggedIn && <MenuItem>Log out</MenuItem>}
            </Menu>
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}

export default withStyles(styles)(Navbar)

