// @flow

import * as React from 'react'
import classNames from 'classnames'
import {Route, Link, withRouter} from 'react-router-dom'
import Switch from 'react-router-transition-switch'
import Fader from 'react-fader'
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'
import {withStyles} from 'material-ui/styles'
import {compose} from 'redux'

import NotFound from './NotFound'
import NavbarContainer from './Navbar/NavbarContainer'
import SidebarContainer from './Sidebar/SidebarContainer'
import type {Dispatch, State} from '../redux/types'
import type {Theme} from '../theme'

const Home = () => <h1>Home</h1>
const About = () => (
  <div>
    <h1>About</h1>
    <Link to="/">Home</Link>
  </div>
)

const styles = ({sidebar}: Theme) => ({
  frame: {
    position: 'fixed',
    display: 'flex',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transition: sidebar.transition,
  },
  contentOpen: {
    left: sidebar.width,
    [`@media (max-width: ${sidebar.autoOpenBreakpoint() - 1}px)`]: {
      right: 'initial',
      width: '100%',
    },
  },
  contentAuto: {
    [`@media (max-width: ${sidebar.autoOpenBreakpoint() - 1}px)`]: {
      left: 0,
    },
    [`@media (min-width: ${sidebar.autoOpenBreakpoint()}px)`]: {
      left: sidebar.width,
    },
  },
  body: {
    padding: '0 20px',
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

type PropsFromJss = {
  classes: Classes,
}

type PropsFromState = {
  sidebarOpen: ?boolean,
}

type PropsFromDispatch = {
  dispatch: Dispatch,
}

type Props = PropsFromJss & PropsFromState & PropsFromDispatch

class App extends React.Component<Props> {
  render(): ?React.Node {
    const {classes, sidebarOpen} = this.props
    return (
      <div className={classes.frame}>
        <SidebarContainer />
        <div
          className={classNames(classes.content, {
            [classes.contentOpen]: sidebarOpen,
            [classes.contentAuto]: sidebarOpen == null,
          })}
        >
          <NavbarContainer />
          <div className={classes.body} id="body">
            <Switch component={Fader}>
              <Route path="/" exact component={Home} />
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
  sidebarOpen: (state: State) => state.sidebar.open,
})

export default compose(
  withRouter,
  withStyles(styles, {withTheme: true}),
  connect(mapStateToProps)
)(App)


