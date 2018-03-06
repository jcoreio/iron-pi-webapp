// @flow

import * as React from 'react'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'
import {compose} from 'redux'
import gql from 'graphql-tag'
import {graphql} from 'react-apollo'
import {withTheme} from 'material-ui/styles'

import LocalIOSidebarSection from './MQTTSidebarSection'
import type {Action, Dispatch, State} from '../../redux/types'
import {setSectionExpanded} from '../../redux/sidebar'
import type {Theme} from '../../theme'

export const MQTT_SECTION = 'mqtt'


type Config = {
  id: number,
  name: string,
}

type PropsFromTheme = {
  theme: Theme,
}

type PropsFromApollo = {
  data: {
    MQTTConfigs: ?Array<Config>,
    loading: boolean,
  },
}

type PropsFromState = {
  loading: boolean,
  expanded: boolean,
  configs: Array<Config>,
}

type PropsFromDispatch = {
  dispatch: Dispatch,
  setExpanded: (expanded: boolean) => Action,
}

type Props = PropsFromState & PropsFromTheme & PropsFromDispatch & PropsFromApollo

class LocalIOSidebarSectionContainer extends React.Component<Props> {
  render(): ?React.Node {
    const {expanded, loading, setExpanded, configs} = this.props
    return (
      <LocalIOSidebarSection
        expanded={expanded}
        onExpandedChange={setExpanded}
        loading={loading}
        configs={configs}
      />
    )
  }
}

const mapStateToProps: (state: State, props: PropsFromApollo) => PropsFromState = createStructuredSelector({
  loading: (state, {data: {loading}}: PropsFromApollo): boolean => loading,
  expanded: (state: State) => state.sidebar.expandedSections.get(MQTT_SECTION, true),
  configs: (state, {data: {MQTTConfigs}}: PropsFromApollo): ?Array<Config> => MQTTConfigs,
})

const mapDispatchToProps = (dispatch: Dispatch) => ({
  dispatch,
  setExpanded: (expanded: boolean) => dispatch(setSectionExpanded(MQTT_SECTION, expanded)),
})

const query = gql(`query MQTTConfigs {
  MQTTConfigs {
    id
    name
  }  
}`)

export default compose(
  graphql(query, {
    name: 'data',
    options: {
      errorPolicy: 'all',
    },
  }),
  withRouter,
  withTheme(),
  connect(mapStateToProps, mapDispatchToProps),
)(LocalIOSidebarSectionContainer)


