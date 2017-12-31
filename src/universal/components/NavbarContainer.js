// @flow

import * as React from 'react'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'
import {compose} from 'redux'
import {withTheme} from 'material-ui/styles'

import Navbar from './Navbar'
import type {Dispatch, State} from '../redux/types'
import {setSidebarOpen} from '../redux/sidebar'
import type {Theme} from '../theme'

type PropsFromTheme = {
  theme: Theme,
}

type PropsFromState = {
  sidebarOpen: boolean,
}

type PropsFromDispatch = {
  dispatch: Dispatch,
}

type Props = PropsFromTheme & PropsFromState & PropsFromDispatch

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
    return (
      <Navbar onToggleSidebar={this.handleToggleSidebar} />
    )
  }
}

const mapStateToProps: (state: State) => PropsFromState = createStructuredSelector({
  sidebarOpen: (state: State) => state.sidebar.open,
})

export default compose(
  withRouter,
  withTheme(),
  connect(mapStateToProps),
)(App)


