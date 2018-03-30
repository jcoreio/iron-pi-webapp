// @flow

import * as React from 'react'
import {graphql} from 'react-apollo'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {compose} from 'redux'
import gql from 'graphql-tag'
import {createStructuredSelector, createSelector} from 'reselect'
import MappingProblemsView from './MappingProblemsView'
import type {MappingProblem} from './MappingProblemsTable'
import type {State, Action} from '../../redux/types'
import type {Features} from 'redux-features'

const selection = `{
  tag
  problem
  mappingLocation {
    pluginType
    pluginId
    pluginName
    channelId
    channelName 
  }
}`

const query = gql(`query {
  MappingProblems ${selection}
}`)

const subscription = gql(`subscription {
  MappingProblems ${selection}
}`)

type Data = {
  MappingProblems?: Array<MappingProblem>,
}

export type MappingProblemsViewContainerProps = {
  data: Data,
  subscribeToMappingProblems: () => any,
  getMappingProblemURL: (mappingProblem: MappingProblem) => ?string,
}

class MappingProblemsViewContainer extends React.Component<MappingProblemsViewContainerProps> {
  componentDidMount() {
    this.props.subscribeToMappingProblems()
  }
  render(): ?React.Node {
    const {data, getMappingProblemURL} = this.props
    return <MappingProblemsView data={data} getMappingProblemURL={getMappingProblemURL} />
  }
}

const mapStateToProps = createStructuredSelector({
  getMappingProblemURL: createSelector(
    (state: State) => state.features,
    (features: Features<State, Action>) => {
      const lookupByPluginType: {[pluginType: string]: (problem: MappingProblem) => ?string} = {}
      for (let key in features) {
        const feature = features[key]
        if (feature.getMappingProblemURL) Object.assign(lookupByPluginType, feature.getMappingProblemURL)
      }
      return (problem: MappingProblem) => {
        const lookup = lookupByPluginType[problem.mappingLocation.pluginType]
        return lookup ? lookup(problem) : null
      }
    }
  ),
})

export default compose(
  graphql(query, {
    options: {
      errorPolicy: 'all',
    },
    props: props => ({
      ...props,
      subscribeToMappingProblems: () => props.data.subscribeToMore({
        document: subscription,
        updateQuery: (prev: Data, update: {data?: Data, subscriptionData: {errors?: Array<Error>}}) => {
          const {subscriptionData: {data, errors}} = (update: any)
          if (errors) {
            errors.forEach(error => console.error(error.message)) // eslint-disable-line no-console
            return prev
          }
          if (!data) return prev
          const {MappingProblems} = data
          return {...prev, MappingProblems}
        },
      })
    })
  }),
  withRouter,
  connect(mapStateToProps)
)(MappingProblemsViewContainer)


