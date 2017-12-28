// @flow

import * as React from 'react'
import {Route, Link, withRouter} from 'react-router-dom'
import Switch from 'react-router-transition-switch'
import Fader from 'react-fader'
import {connect} from 'react-redux'
import {createSelector, createStructuredSelector} from 'reselect'
import injectSheet from 'react-jss'
import {compose} from 'redux'
import gql from 'graphql-tag'
import {graphql} from 'react-apollo'

import NotFound from './NotFound'
import Hello from './Hello'
import Navbar from './Navbar'
import Sidebar, {drawerWidth} from './Sidebar'
import type {Dispatch, State} from '../redux/types'
import {setSidebarOpen} from '../redux/sidebar'
import selectSidebarOpen from '../selectors/selectSidebarOpen'
import selectIsWide from '../selectors/selectIsWide'
import type {ChannelMode} from '../types/Channel'

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
    left: ({isWide, sidebarOpen}) => isWide && sidebarOpen ? drawerWidth : 0,
    right: 0,
    bottom: 0,
    transition: 'left ease 250ms',
  },
  appBody: {
    padding: '0 20px',
  },
}

type Classes = {[name: $Keys<typeof styles>]: string}

type PropsFromJss = {
  classes: Classes,
}

type Channel = {
  id: number,
  name: string,
  mode: ChannelMode,
}

type PropsFromApollo = {
  data: {
    Channels: ?Array<Channel>,
    loading: boolean,
  },
}

type PropsFromState = {
  sidebarOpen: boolean,
  isWide: boolean,
  localIO?: {
    expanded?: boolean,
    channels: Array<Channel>,
  },
}

type PropsFromDispatch = {
  dispatch: Dispatch,
}

type Props = PropsFromJss & PropsFromState & PropsFromDispatch & PropsFromApollo

class App extends React.Component<Props> {
  handleToggleSidebar = () => {
    const {dispatch, sidebarOpen} = this.props
    dispatch(setSidebarOpen(!sidebarOpen))
  }
  handleSidebarClose = () => this.props.dispatch(setSidebarOpen(false))

  render(): ?React.Node {
    const {sidebarOpen, localIO, classes} = this.props
    return (
      <div className={classes.appFrame}>
        <Sidebar open={sidebarOpen} onClose={this.handleSidebarClose} localIO={localIO} />
        <div className={classes.appContent}>
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

const mapStateToProps: (state: State, props: PropsFromApollo) => PropsFromState = createStructuredSelector({
  sidebarOpen: selectSidebarOpen,
  isWide: selectIsWide,
  localIO: createSelector(
    (state, {data: {Channels}}): ?Array<Channel> => Channels,
    (Channels: ?Array<Channel>) => {
      if (!Channels) return null
      return {
        expanded: true,
        channels: Channels,
      }
    }
  ),
})

const query = gql(`{
  Channels {
    id
    name 
    mode
  }  
}`)

export default compose(
  graphql(query),
  withRouter,
  connect(mapStateToProps),
  injectSheet(styles)
)(App)


