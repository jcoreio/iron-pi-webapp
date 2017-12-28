// @flow

import * as React from 'react'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {createSelector, createStructuredSelector} from 'reselect'
import {compose} from 'redux'
import gql from 'graphql-tag'
import {graphql} from 'react-apollo'

import Sidebar from './Sidebar'
import type {Dispatch, State} from '../redux/types'
import {setSidebarOpen} from '../redux/sidebar'
import selectSidebarOpen from '../selectors/selectSidebarOpen'
import type {ChannelMode} from '../types/Channel'

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
  open: boolean,
  localIO?: {
    expanded?: boolean,
    channels: Array<Channel>,
  },
}

type PropsFromDispatch = {
  dispatch: Dispatch,
}

type Props = PropsFromState & PropsFromDispatch & PropsFromApollo

class SidebarContainer extends React.Component<Props> {
  handleSidebarClose = () => this.props.dispatch(setSidebarOpen(false))

  render(): ?React.Node {
    const {open, localIO} = this.props
    return (
      <Sidebar open={open} onClose={this.handleSidebarClose} localIO={localIO} />
    )
  }
}

const mapStateToProps: (state: State, props: PropsFromApollo) => PropsFromState = createStructuredSelector({
  open: selectSidebarOpen,
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
)(SidebarContainer)


