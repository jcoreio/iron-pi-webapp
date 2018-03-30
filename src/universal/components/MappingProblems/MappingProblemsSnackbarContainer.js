// @flow

import * as React from 'react'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import MappingProblemsSnackbar from './MappingProblemsSnackbar'

const query = gql(`query {
  numMappingProblems
}`)

const subscription = gql(`subscription {
  numMappingProblems
}`)

type Data = {
  numMappingProblems?: number,
}

export type Props = {
  data: Data,
  subscribeToNumMappingProblems: () => any,
}

class MappingProblemsSnackbarContainer extends React.Component<Props> {
  componentDidMount() {
    this.props.subscribeToNumMappingProblems()
  }
  render(): ?React.Node {
    const {data} = this.props
    return <MappingProblemsSnackbar data={data} />
  }
}

export default graphql(query, {
  options: {
    errorPolicy: 'all',
  },
  props: props => ({
    ...props,
    subscribeToNumMappingProblems: () => props.data.subscribeToMore({
      document: subscription,
      updateQuery: (prev: Data, update: {data?: Data, subscriptionData: {errors?: Array<Error>}}) => {
        const {subscriptionData: {data, errors}} = (update: any)
        if (errors) {
          errors.forEach(error => console.error(error.message)) // eslint-disable-line no-console
          return prev
        }
        if (!data) return prev
        const {numMappingProblems} = data
        return {...prev, numMappingProblems}
      },
    })
  })
})(MappingProblemsSnackbarContainer)


