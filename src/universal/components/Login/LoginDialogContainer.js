// @flow

import * as React from 'react'
import {withRouter} from 'react-router-dom'
import type {Location} from 'react-router-dom'
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'
import {compose} from 'redux'
import gql from 'graphql-tag'
import {graphql} from 'react-apollo'

import type {Dispatch, State} from '../../redux/types'
import LoginDialog from './LoginDialog'
import LoginFormContainer from './LoginFormContainer'
import {FORGOT_PASSWORD} from '../../react-router/paths'

type PropsFromApollo = {
  data: {
    currentUser: ?{
      id: number,
    },
    loading: boolean,
  },
  subscribeToRootPasswordHasBeenSet: () => any,
}

type PropsFromState = {
  open: boolean,
}

type PropsFromRouter = {
  location: Location,
}

type PropsFromDispatch = {
  dispatch: Dispatch,
}

type Props = PropsFromApollo & PropsFromState & PropsFromDispatch

class LoginDialogContainer extends React.Component<Props> {
  componentDidMount() {
    this.props.subscribeToRootPasswordHasBeenSet()
  }

  render(): React.Node {
    const {open} = this.props
    return (
      <LoginDialog open={open}>
        <LoginFormContainer />
      </LoginDialog>
    )
  }
}

const mapStateToProps: (state: State, props: PropsFromApollo & PropsFromRouter) => PropsFromState = createStructuredSelector({
  open: (state: State, props: PropsFromApollo & PropsFromRouter) =>
    props.location.pathname === FORGOT_PASSWORD || (!props.data.loading && props.data.currentUser == null),
})

const query = gql(`{
  currentUser {
    id
  }
  rootPasswordHasBeenSet
}`)

const subscription = gql(`subscription {
  rootPasswordHasBeenSet
}`)

type Data = {
  currentUser?: {id: number},
  rootPasswordHasBeenSet: boolean,
}

export default compose(
  withRouter,
  graphql(query, {
    props: props => ({
      ...props,
      subscribeToRootPasswordHasBeenSet: () => props.data.subscribeToMore({
        document: subscription,
        updateQuery: (prev: Data, update: {subscriptionData: {errors?: Array<Error>, data?: Data}}): Data => {
          const {subscriptionData: {data}} = update
          if (!data) return prev
          const {rootPasswordHasBeenSet} = data
          return {
            ...prev,
            rootPasswordHasBeenSet,
          }
        }
      })
    })
  }),
  connect(mapStateToProps),
)(LoginDialogContainer)


