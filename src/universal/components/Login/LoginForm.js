// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'
import {Field} from 'redux-form/immutable'
import {TextField} from 'redux-form-material-ui'
import ErrorIcon from 'material-ui-icons/Error'
import Snackbar from 'material-ui/Snackbar'

import Spinner from '../Spinner'
import type {Theme} from '../../theme'

const styles = (theme: Theme) => ({
  root: {
  },
  footer: {
    textAlign: 'right',
    '& > :not(:first-child)': {
      marginLeft: 5,
    }
  },
  error: {
    maxWidth: 180,
  }
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  onSubmit: (event: Event) => any,
  submitting?: boolean,
  valid?: boolean,
  error?: any,
}

const required = value => value == null ? 'Required' : null

class LoginForm extends React.Component<Props> {
  render(): ?React.Node {
    const {classes, onSubmit, submitting, valid, error} = this.props
    return (
      <form id="loginForm" className={classes.root} onSubmit={onSubmit}>
        <Snackbar
          open={error != null}
          message={<span><ErrorIcon /> {error}</span>}
        />
        <Field
          data-test-name="password"
          name="password"
          type="password"
          label="Password"
          component={TextField}
          margin="normal"
          validate={required}
        />
        <div className={classes.footer}>
          {submitting && <Spinner />}
          <Button
            type="submit"
            raised
            color="primary"
            disabled={!valid || submitting}
          >
            Log In
          </Button>
        </div>
      </form>
    )
  }
}

export default withStyles(styles, {withTheme: true})(LoginForm)
