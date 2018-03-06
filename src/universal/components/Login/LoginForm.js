// @flow

import * as React from 'react'
import {Link} from 'react-router-dom'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'
import {Field} from 'redux-form'
import TextField from '../TextField'
import ErrorAlert from '../ErrorAlert'
import Autocollapse from '../Autocollapse'
import {required} from 'redux-form-validators'

import Spinner from '../Spinner'
import type {Theme} from '../../theme'
import {FORGOT_PASSWORD} from '../../react-router/paths'

const styles = ({palette, spacing, typography}: Theme) => ({
  root: {
  },
  footer: {
    textAlign: 'right',
    '& > :not(:first-child)': {
      marginLeft: spacing.unit,
    }
  },
  forgotPasswordHolder: {
    marginTop: spacing.unit,
  },
  forgotPasswordLink: {
    fontSize: typography.pxToRem(14),
    '&, &:visited, &:active, &:focus, &:hover': {
      color: palette.text.primary,
    },
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
  header: {
    marginBottom: 0,
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
        <h3 className={classes.header}>Log In</h3>
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
          <div className={classes.forgotPasswordHolder}>
            <Link
              id="forgotPasswordLink"
              to={FORGOT_PASSWORD}
              className={classes.forgotPasswordLink}
            >
              Forgot Password?
            </Link>
          </div>
        </div>
      </form>
    )
  }
}

export default withStyles(styles, {withTheme: true})(LoginForm)
