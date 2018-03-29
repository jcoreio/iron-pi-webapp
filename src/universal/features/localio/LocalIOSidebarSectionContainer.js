// @flow

import * as React from 'react'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'
import {compose} from 'redux'
import gql from 'graphql-tag'
import {graphql} from 'react-apollo'
import {withTheme} from 'material-ui/styles'

import LocalIOSidebarSection from './LocalIOSidebarSection'
import type {Action, Dispatch, State} from '../../redux/types'
import {setSectionExpanded} from '../../redux/sidebar'
import type {Theme} from '../../theme'
import createSubscribeToChannelStates from '../../localio/apollo/createSubscribeToChannelStates'
import {ALL_FIELDS_SELECTION as ALL_STATE_FIELDS} from '../../localio/apollo/createSubscribeToChannelState'

export const LOCAL_IO_SECTION = 'localio'

type ChannelState = {
  id?: number,
  value: number,
}

type Channel = {
  id: number,
  name: string,
  state?: ChannelState,
}

type PropsFromTheme = {
  theme: Theme,
}

type PropsFromApollo = {
  data: {
    LocalIOChannels: ?Array<Channel>,
    loading: boolean,
  },
  subscribeToChannelStates: () => any,
}

type PropsFromState = {
  loading: boolean,
  expanded: boolean,
  channels: Array<Channel>,
}

type PropsFromDispatch = {
  dispatch: Dispatch,
  setExpanded: (expanded: boolean) => Action,
}

type Props = PropsFromState & PropsFromTheme & PropsFromDispatch & PropsFromApollo

class LocalIOSidebarSectionContainer extends React.Component<Props> {
  componentDidMount() {
    this.props.subscribeToChannelStates()
  }

  render(): ?React.Node {
    const {expanded, loading, setExpanded, channels} = this.props
    return (
      <LocalIOSidebarSection
        expanded={expanded}
        onExpandedChange={setExpanded}
        loading={loading}
        channels={channels}
      />
    )
  }
}

const mapStateToProps: (state: State, props: PropsFromApollo) => PropsFromState = createStructuredSelector({
  loading: (state, {data: {loading}}: PropsFromApollo): boolean => loading,
  expanded: (state: State) => state.sidebar.expandedSections.get(LOCAL_IO_SECTION, true),
  channels: (state, {data: {LocalIOChannels}}: PropsFromApollo): ?Array<Channel> => LocalIOChannels,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch,
  setExpanded: (expanded: boolean) => dispatch(setSectionExpanded(LOCAL_IO_SECTION, expanded)),
})

const query = gql(`{
  LocalIOChannels {
    id
    name
    metadataItem {
      tag
      min
      max
    } 
    state ${ALL_STATE_FIELDS}
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
      subscribeToChannelStates: createSubscribeToChannelStates(props, {
        query,
      })
    }),
  }),
  withRouter,
  withTheme(),
  connect(mapStateToProps, mapDispatchToProps),
)(LocalIOSidebarSectionContainer)


