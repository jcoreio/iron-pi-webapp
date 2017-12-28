// @flow

import * as React from 'react'
import {Route, Link, withRouter} from 'react-router-dom'
import Switch from 'react-router-transition-switch'
import Fader from 'react-fader'
import {connect} from 'react-redux'
import {createSelector, createStructuredSelector} from 'reselect'
import injectSheet from 'react-jss'
import {compose} from 'redux'

import NotFound from './NotFound'
import Hello from './Hello'
import {drawerWidth} from './Sidebar'
import NavbarContainer from './NavbarContainer'
import SidebarContainer from './SidebarContainer'
import type {Dispatch, State} from '../redux/types'
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
    left: props => props.pushBodyOver ? drawerWidth : 0,
    right: 0,
    bottom: 0,
    transition: 'left ease 250ms',
  },
  appBody: {
    padding: '0 20px',
  },
}

type PropsFromJss = {
  classes: {[name: $Keys<typeof styles>]: string},
}

type PropsFromState = {
  pushBodyOver: boolean,
}

type PropsFromDispatch = {
  dispatch: Dispatch,
}

type Props = PropsFromJss & PropsFromState & PropsFromDispatch

class App extends React.Component<Props> {
  render(): ?React.Node {
    const {classes} = this.props
    return (
      <div className={classes.appFrame}>
        <SidebarContainer />
        <div className={classes.appContent}>
          <NavbarContainer />
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

const mapStateToProps: (state: State) => PropsFromState = createStructuredSelector({
  pushBodyOver: createSelector(
    selectSidebarOpen,
    selectIsWide,
    (sidebarOpen: boolean, isWide: boolean) => sidebarOpen && isWide
  ),
})

export default compose(
  withRouter,
  connect(mapStateToProps),
  injectSheet(styles)
)(App)


