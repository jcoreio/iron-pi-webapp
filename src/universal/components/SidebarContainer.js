// @flow

import * as React from 'react'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {createSelector, createStructuredSelector} from 'reselect'
import {compose, bindActionCreators} from 'redux'
import gql from 'graphql-tag'
import {graphql} from 'react-apollo'

import Sidebar from './Sidebar'
import type {Action, Dispatch, State} from '../redux/types'
import {setSidebarOpen, setSectionExpanded} from '../redux/sidebar'
import type {ChannelMode} from '../types/Channel'
import type {SectionName} from '../redux/sidebar'

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
  open: ?boolean,
  localIO?: {
    expanded?: boolean,
    channels: Array<Channel>,
  },
}

type PropsFromDispatch = {
  dispatch: Dispatch,
  setSidebarOpen: (open: boolean) => Action,
  setSectionExpanded: (section: SectionName, expanded: boolean) => Action,
}

type Props = PropsFromState & PropsFromDispatch & PropsFromApollo

class SidebarContainer extends React.Component<Props> {
  handleSidebarClose = () => this.props.setSidebarOpen(false)

  render(): ?React.Node {
    const {open, localIO, setSectionExpanded} = this.props
    return (
      <Sidebar
        open={open}
        onClose={this.handleSidebarClose}
        onSectionExpandedChange={setSectionExpanded}
        localIO={localIO}
      />
    )
  }
}

const mapStateToProps: (state: State, props: PropsFromApollo) => PropsFromState = createStructuredSelector({
  open: (state: State) => state.sidebar.open,
  localIO: createSelector(
    (state: State) => state.sidebar.expandedSections.get('localIO', true),
    (state, {data: {Channels}}): ?Array<Channel> => Channels,
    (expanded: boolean, Channels: ?Array<Channel>) => {
      if (!Channels) return null
      return {
        expanded,
        channels: Channels,
      }
    }
  ),
})

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
  setSidebarOpen,
  setSectionExpanded,
}, dispatch)

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
  connect(mapStateToProps, mapDispatchToProps),
)(SidebarContainer)


