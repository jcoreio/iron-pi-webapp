// @flow

import * as React from 'react'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import MappingProblemsView from './MappingProblemsView'
import type {MappingProblem} from './MappingProblemsTable'

const selection = `{
  tag
  problem
  mappingLocation {
    pluginName
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
}

class MappingProblemsViewContainer extends React.Component<MappingProblemsViewContainerProps> {
  componentDidMount() {
    this.props.subscribeToMappingProblems()
  }
  render(): ?React.Node {
    const {data} = this.props
    return <MappingProblemsView data={data} />
  }
}

export default graphql(query, {
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
})(MappingProblemsViewContainer)


