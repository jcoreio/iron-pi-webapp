// @flow

import * as React from 'react'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'
import {compose} from 'redux'

import Navbar from './Navbar'
import type {Dispatch, State} from '../redux/types'
import {setSidebarOpen} from '../redux/sidebar'
import selectSidebarOpen from '../selectors/selectSidebarOpen'

type PropsFromState = {
  sidebarOpen: boolean,
}

type PropsFromDispatch = {
  dispatch: Dispatch,
}

type Props = PropsFromState & PropsFromDispatch

class App extends React.Component<Props> {
  handleToggleSidebar = () => {
    const {dispatch, sidebarOpen} = this.props
    dispatch(setSidebarOpen(!sidebarOpen))
  }
  handleSidebarClose = () => this.props.dispatch(setSidebarOpen(false))

  render(): ?React.Node {
    return (
      <Navbar onToggleSidebar={this.handleToggleSidebar} />
    )
  }
}

const mapStateToProps: (state: State) => PropsFromState = createStructuredSelector({
  sidebarOpen: selectSidebarOpen,
})

export default compose(
  withRouter,
  connect(mapStateToProps),
)(App)


