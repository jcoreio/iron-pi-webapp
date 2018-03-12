// @flow

import * as React from 'react'
import {Route, Link} from 'react-router-dom'
import Switch from 'react-router-transition-switch'
import Fader from '../Fader'

import {withStyles} from 'material-ui/styles'
import AppBar from 'material-ui/AppBar'
import Toolbar from 'material-ui/Toolbar'
import IconButton from 'material-ui/IconButton'
import Icon from 'material-ui/Icon'
import MenuIcon from 'material-ui-icons/Menu'
import AccountCircle from 'material-ui-icons/AccountCircle'
import Menu, { MenuItem } from 'material-ui/Menu'
import featureContent from '../featureContent'
import Title from './Title'
import {CHANGE_PASSWORD, MAPPING_PROBLEMS, STATUS} from '../../react-router/paths'

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
  appBar: {
    position: 'relative',
  },
}

export type Props = {
  classes: {[name: $Keys<typeof styles>]: string},
  onToggleSidebar?: () => any,
  loggedIn?: boolean,
  onLogOutClick?: (event: MouseEvent) => any,
}

export type State = {
  userMenuAnchorEl: ?HTMLElement,
}

const NavbarRoutes = featureContent({getContent: feature => (feature: any).navbarRoutes})

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
  handleLogOutClick = (event: MouseEvent) => {
    this.setState({userMenuAnchorEl: null}, () => {
      const {onLogOutClick} = this.props
      if (onLogOutClick) onLogOutClick(event)
    })
  }
  render(): ?React.Node {
    const {classes, onToggleSidebar, loggedIn} = this.props
    const {userMenuAnchorEl} = this.state
    return (
      <div id="navbar" className={classes.root}>
        <AppBar color="default" className={classes.appBar}>
          <Toolbar className={classes.toolbar}>
            <IconButton
              id="toggleSidebarButton"
              aria-label="toggle sidebar"
              onClick={onToggleSidebar}
              className={classes.menuButton}
            >
              <Icon><MenuIcon /></Icon>
            </IconButton>
            <div className={classes.title}>
              <NavbarRoutes>
                {routes => (
                  <Switch component={Fader}>
                    <Route path="/about" exact render={() => <Title>About</Title>} />
                    <Route path={STATUS} exact render={() => <Title>Status</Title>} />
                    <Route path={CHANGE_PASSWORD} exact render={() => <div />} />
                    <Route path={MAPPING_PROBLEMS} exact render={() => <Title>Mapping Problems</Title>} />
                    {routes}
                    <Route path="*" render={() => <Title>Not Found</Title>} />
                  </Switch>
                )}
              </NavbarRoutes>
            </div>
            {loggedIn &&
              <IconButton
                id="openUserMenuButton"
                aria-label="open user menu"
                aria-owns={userMenuAnchorEl != null ? "userMenu" : null}
                aria-haspopup="true"
                onClick={this.handleOpenUserMenu}
              >
                <Icon><AccountCircle /></Icon>
              </IconButton>
            }
            {loggedIn &&
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
                <MenuItem id="logOutMenuItem" onClick={this.handleLogOutClick}>Log out</MenuItem>
                <MenuItem
                  id="changePasswordMenuItem"
                  component={Link}
                  to={CHANGE_PASSWORD}
                  onClick={this.handleCloseUserMenu}
                >
                  Change Password
                </MenuItem>
              </Menu>
            }
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}

export default withStyles(styles)(Navbar)

