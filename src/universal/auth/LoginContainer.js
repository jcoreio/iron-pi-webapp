/* @flow */

import * as React from 'react'
import type {Map} from 'immutable'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'
import {Grid, Row, Col} from '@jcoreio/rubix'
import LoginForm from './LoginForm'
import {loginWithPassword, LOGGING_IN} from './redux'
import type {Auth} from './redux'
import injectSheet from 'react-jss'
import type {State, Dispatch} from '../redux/types'

const styles = {
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    padding: 25,
    backgroundColor: '#eee',
    boxShadow: '0 0 200px 50px #ccc inset',
  }
}

type SelectProps = {
  loggingIn: boolean,
  loginError?: Error,
}

type Props = SelectProps & {
  dispatch: Dispatch,
  classes: {
    root: string,
  },
}

/**
 * Wraps LoginForm to provide the auth status and submit handler.
 */
class LoginContainer extends React.Component<Props, void> {
  onSubmit = (values: Map<string, string>) => {
    const {username, password} = values.toObject()
    const {dispatch} = this.props
    return dispatch(loginWithPassword(username, password))
  }
  render(): React.Node {
    const {classes} = this.props
    return (
      <Grid className={classes.root}>
        <Row>
          <Col sm={6} smOffset={3} xs={10} xsOffset={1}>
            <LoginForm {...this.props} onSubmit={this.onSubmit} />
          </Col>
        </Row>
      </Grid>
    )
  }
}

const select = createSelector(
  (state: State) => state.auth,
  ({status, error}: Auth) => ({
    loggingIn: status === LOGGING_IN,
    loginError: error,
  })
)

export default connect(select)(injectSheet(styles)(LoginContainer))
