// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'
import {Field} from 'redux-form'
import {TextField} from 'redux-form-material-ui'
import ErrorAlert from '../ErrorAlert'
import Autocollapse from '../Autocollapse'
import {required} from '@jcoreio/redux-form-validators'

import Spinner from '../Spinner'
import type {Theme} from '../../theme'

const styles = ({palette, spacing}: Theme) => ({
  root: {
  },
  footer: {
    textAlign: 'right',
    '& > :not(:first-child)': {
      marginLeft: 5,
    }
  },
  error: {
    color: palette.error.A400,
    display: 'flex',
  },
  errorIcon: {
    marginRight: spacing.unit,
  },
  errorMessage: {
    flexGrow: 1,
  },
  passwordField: {
    width: '100%',
  },
  loginButton: {
    padding: `${spacing.unit}px ${spacing.unit * 5}px`,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  passwordFieldClass?: string,
  onSubmit: (event: Event) => any,
  submitting?: boolean,
  valid?: boolean,
  error?: any,
}

class LoginForm extends React.Component<Props> {
  render(): ?React.Node {
    const {classes, onSubmit, submitting, valid, error} = this.props
    return (
      <form id="loginForm" className={classes.root} onSubmit={onSubmit}>
        <Autocollapse>
          {error ? <ErrorAlert data-test-name="submitError">{error}</ErrorAlert> : null}
        </Autocollapse>
        <Field
          data-test-name="password"
          name="password"
          type="password"
          label="Password"
          component={TextField}
          className={classes.passwordField}
          margin="normal"
          validate={required()}
        />
        <div className={classes.footer}>
          {submitting && <Spinner />}
          <Button
            type="submit"
            raised
            color="primary"
            className={classes.loginButton}
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
