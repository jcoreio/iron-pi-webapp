// @flow

import * as React from 'react'
import {Route, Link, withRouter} from 'react-router-dom'
import Switch from 'react-router-transition-switch'
import Fader from 'react-fader'
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'
import NotFound from './NotFound'
import Hello from './Hello'
import Navbar from './Navbar'
import Sidebar, {drawerWidth} from './Sidebar'
import {withStyles} from 'material-ui/styles'
import type {Dispatch} from '../redux/types'
import {setSidebarOpen} from '../redux/sidebar'
import selectSidebarOpen from '../selectors/selectSidebarOpen'
import selectIsWide from '../selectors/selectIsWide'

const Home = () => <h1>Home</h1>
const About = () => (
  <div>
    <h1>About</h1>
    <Link to="/">Home</Link>
  </div>
)

const styles = {
  appFrame: {
    position: 'fixed',
    display: 'flex',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  appContent: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    transition: 'left ease 250ms',
  },
  appBody: {
    padding: '0 20px',
  },
}

type Classes = {[name: $Keys<typeof styles>]: string}

type InputProps = {
  classes: Classes,
}

type PropsFromState = {
  sidebarOpen: boolean,
  isWide: boolean,
}

type PropsFromDispatch = {
  dispatch: Dispatch,
}

type Props = InputProps & PropsFromState & PropsFromDispatch

class App extends React.Component<Props> {
  handleToggleSidebar = () => {
    const {dispatch, sidebarOpen} = this.props
    dispatch(setSidebarOpen(!sidebarOpen))
  }
  handleSidebarClose = () => this.props.dispatch(setSidebarOpen(false))

  render(): ?React.Node {
    const {sidebarOpen, isWide, classes} = this.props
    return (
      <div className={classes.appFrame}>
        <Sidebar open={sidebarOpen} onClose={this.handleSidebarClose} />
        <div className={classes.appContent} style={{left: isWide && sidebarOpen ? drawerWidth : 0}}>
          <Navbar onToggleSidebar={this.handleToggleSidebar} />
          <div className={classes.appBody} id="body">
            <Switch component={Fader}>
              <Route path="/" exact component={Home} />
              <Route path="/hello" exact component={Hello} />
              <Route path="/about" exact component={About} />
              <Route path="*" component={NotFound} />
            </Switch>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  sidebarOpen: selectSidebarOpen,
  isWide: selectIsWide,
})

export default withRouter(connect(mapStateToProps)(withStyles(styles)(App)))

