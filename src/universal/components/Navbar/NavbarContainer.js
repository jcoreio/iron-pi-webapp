// @flow

import * as React from 'react'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'
import {compose} from 'redux'
import {withTheme} from 'material-ui/styles'
import gql from 'graphql-tag'
import {graphql} from 'react-apollo'

import Navbar from './Navbar'
import type {Dispatch, State} from '../../redux/types'
import {setSidebarOpen} from '../../redux/sidebar'
import type {Theme} from '../../theme/index'

type PropsFromTheme = {
  theme: Theme,
}

type PropsFromApollo = {
  data: {
    currentUser: ?{
      id: number,
    },
    loading: boolean,
  },
}

type PropsFromState = {
  sidebarOpen: boolean,
  loggedIn: boolean,
}

type PropsFromDispatch = {
  dispatch: Dispatch,
}

type Props = PropsFromTheme & PropsFromApollo & PropsFromState & PropsFromDispatch

class App extends React.Component<Props> {
  handleToggleSidebar = () => {
    if (typeof window === 'undefined') return
    /* global window */
    const {dispatch, theme} = this.props
    let {sidebarOpen} = this.props
    if (sidebarOpen == null) sidebarOpen = theme.sidebar.isAutoOpen(window.innerWidth)
    dispatch(setSidebarOpen(!sidebarOpen))
  }

  render(): ?React.Node {
    const {loggedIn} = this.props
    return (
      <Navbar onToggleSidebar={this.handleToggleSidebar} loggedIn={loggedIn} />
    )
  }
}

const mapStateToProps: (state: State, props: PropsFromApollo) => PropsFromState = createStructuredSelector({
  sidebarOpen: (state: State) => state.sidebar.open,
  loggedIn: (state: State, props: PropsFromApollo) => props.data.currentUser != null,
})

const query = gql(`{
  currentUser {
    id
  }
}`)

export default compose(
  withRouter,
  withTheme(),
  graphql(query),
  connect(mapStateToProps),
)(App)


