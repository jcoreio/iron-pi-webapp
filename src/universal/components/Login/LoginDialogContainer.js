// @flow

import * as React from 'react'
import {withRouter} from 'react-router-dom'
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'
import {compose} from 'redux'
import gql from 'graphql-tag'
import {graphql} from 'react-apollo'

import type {Dispatch, State} from '../../redux/types'
import LoginDialog from './LoginDialog'
import LoginFormContainer from './LoginFormContainer'

type PropsFromApollo = {
  data: {
    currentUser: ?{
      id: number,
    },
    loading: boolean,
  },
}

type PropsFromState = {
  open: boolean,
}

type PropsFromDispatch = {
  dispatch: Dispatch,
}

type Props = PropsFromApollo & PropsFromState & PropsFromDispatch

const LoginDialogContainer = ({open}: Props) => (
  <LoginDialog open={open}>
    <LoginFormContainer />
  </LoginDialog>
)

const mapStateToProps: (state: State, props: PropsFromApollo) => PropsFromState = createStructuredSelector({
  open: (state: State, props: PropsFromApollo) => !props.data.loading && props.data.currentUser == null,
})

const query = gql(`{
  currentUser {
    id
  }
}`)

export default compose(
  withRouter,
  graphql(query),
  connect(mapStateToProps),
)(LoginDialogContainer)


