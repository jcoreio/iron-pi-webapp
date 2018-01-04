// @flow

import * as React from 'react'
import {withRouter} from 'react-router-dom'
import type {Location} from 'react-router-dom'
import {connect} from 'react-redux'
import {createSelector, createStructuredSelector} from 'reselect'
import {compose, bindActionCreators} from 'redux'
import gql from 'graphql-tag'
import {graphql} from 'react-apollo'
import {withTheme} from 'material-ui/styles'
import {throttle} from 'lodash'

import Sidebar from './Sidebar'
import type {Action, Dispatch, State} from '../../redux/types'
import {setSidebarOpen, setSectionExpanded} from '../../redux/sidebar'
import type {ChannelMode} from '../../types/Channel'
import type {SectionName} from '../../redux/sidebar'
import type {Theme} from '../../theme'

type ChannelState = {
  id?: number,
  value: number,
}

type Channel = {
  id: number,
  name: string,
  mode: ChannelMode,
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
  localIO?: {
    expanded?: boolean,
    channels: Array<Channel>,
  },
}

type PropsFromDispatch = {
  dispatch: Dispatch,
  setSidebarOpen: (open: ?boolean) => Action,
  setSectionExpanded: (section: SectionName, expanded: boolean) => Action,
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
    (state, {data: {Channels}}: PropsFromApollo): ?Array<Channel> => Channels,
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
    state {
      id
      value
    }
  }  
}`)

const channelStatesSubscription = gql(`
  subscription ChannelStates {
    ChannelStates {
      id
      value
    }
  }  
`)

export default compose(
  graphql(query, {
    name: 'data',
    options: {
      errorPolicy: 'all',
    },
    props: props => ({
      ...props,
      subscribeToChannelStates: () => {
        return props.data.subscribeToMore({
          document: channelStatesSubscription,
          updateQuery: (prev: {Channels: Array<Channel>}, update: {subscriptionData: {data: ?{ChannelStates: ChannelState}, errors?: Array<Error>}}) => {
            const {subscriptionData: {data, errors}} = update
            if (errors) {
              errors.forEach(error => console.error(error.message)) // eslint-disable-line no-console
              return prev
            }
            if (!data) return prev
            const {ChannelStates: newState} = data
            if (!newState.id) return prev
            const Channels = [...prev.Channels]
            const index = Channels.findIndex(channel => channel.id === newState.id)
            if (index >= 0) Channels[index] = {
              ...Channels[index],
              state: newState,
            }
            return {
              ...prev,
              Channels,
            }
          },
        })
      }
    }),
  }),
  withRouter,
  withTheme(),
  connect(mapStateToProps, mapDispatchToProps),
)(SidebarContainer)


