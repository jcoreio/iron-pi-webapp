// @flow

import * as React from 'react'
import {withRouter} from 'react-router-dom'
import type {Location} from 'react-router-dom'
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'
import {compose, bindActionCreators} from 'redux'
import {withTheme} from 'material-ui/styles'
import throttle from 'lodash.throttle'

import Sidebar from './Sidebar'
import type {Action, Dispatch, State} from '../../redux/types'
import {setSidebarOpen} from '../../redux/sidebar'
import type {Theme} from '../../theme'

type PropsFromRouter = {
  location: Location,
}

type PropsFromTheme = {
  theme: Theme,
}

type PropsFromState = {
  open: ?boolean,
}

type PropsFromDispatch = {
  dispatch: Dispatch,
  setSidebarOpen: (open: ?boolean) => Action,
}

type Props = PropsFromState & PropsFromRouter & PropsFromTheme & PropsFromDispatch

class SidebarContainer extends React.Component<Props> {
  handleSidebarClose = () => this.props.setSidebarOpen(false)

  closeSidebarIfNecessary = () => {
    if (typeof window !== 'undefined') {
      /* eslint-env browser */
      const {open, setSidebarOpen, theme: {sidebar: {isAutoOpen}}} = this.props
      if (open && !isAutoOpen(window.innerWidth)) {
        setSidebarOpen(null)
      }
    }
  }

  handleWindowResize = throttle(this.closeSidebarIfNecessary, 250)

  componentDidMount() {
    if (typeof window !== 'undefined') {
      /* eslint-env browser */
      window.addEventListener('resize', this.handleWindowResize, true)
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      /* eslint-env browser */
      window.removeEventListener('resize', this.handleWindowResize, true)
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.location.key !== this.props.location.key) {
      this.closeSidebarIfNecessary()
    }
  }

  render(): ?React.Node {
    const {open} = this.props
    return (
      <Sidebar
        open={open}
        onClose={this.handleSidebarClose}
      />
    )
  }
}

const mapStateToProps: (state: State) => PropsFromState = createStructuredSelector({
  open: (state: State) => state.sidebar.open,
})

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
  setSidebarOpen,
}, dispatch)


export default compose(
  withRouter,
  withTheme(),
  connect(mapStateToProps, mapDispatchToProps),
)(SidebarContainer)

