// @flow

import * as React from 'react'
import {withRouter} from 'react-router-dom'
import type {Location} from 'react-router-dom'
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'
import {compose, bindActionCreators} from 'redux'
import gql from 'graphql-tag'
import {graphql} from 'react-apollo'
import {withTheme} from 'material-ui/styles'
import throttle from 'lodash.throttle'

import Sidebar from './Sidebar'
import type {Action, Dispatch, State} from '../../redux/types'
import {setSidebarOpen} from '../../redux/sidebar'
import type {Theme} from '../../theme'
import createSubscribeToChannelStates from '../../apollo/createSubscribeToChannelStates'

type ChannelState = {
  id?: number,
  value: number,
}

type Channel = {
  id: number,
  name: string,
  state?: ChannelState,
}

type PropsFromRouter = {
  location: Location,
}

type PropsFromTheme = {
  theme: Theme,
}

type PropsFromApollo = {
  data: {
    Channels: ?Array<Channel>,
    loading: boolean,
  },
  subscribeToChannelStates: () => any,
}

type PropsFromState = {
  open: ?boolean,
}

type PropsFromDispatch = {
  dispatch: Dispatch,
  setSidebarOpen: (open: ?boolean) => Action,
}

type Props = PropsFromState & PropsFromRouter & PropsFromTheme & PropsFromDispatch & PropsFromApollo

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
    this.props.subscribeToChannelStates()
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

const mapStateToProps: (state: State, props: PropsFromApollo) => PropsFromState = createStructuredSelector({
  open: (state: State) => state.sidebar.open,
})

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
  setSidebarOpen,
}, dispatch)

// use {gt: 0} instead of {not: null} because apollo doesn't seem to support inline null
const query = gql(`{
  Channels(where: {physicalChannelId: {gt: 0}}) {
    id
    physicalChannelId
    name 
    config
    state
  }  
}`)

export default compose(
  graphql(query, {
    name: 'data',
    options: {
      errorPolicy: 'all',
    },
    props: props => ({
      ...props,
      subscribeToChannelStates: createSubscribeToChannelStates(props)
    }),
  }),
  withRouter,
  withTheme(),
  connect(mapStateToProps, mapDispatchToProps),
)(SidebarContainer)


