// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'
import {Field} from 'redux-form'
import TextField from '../TextField'
import ErrorAlert from '../ErrorAlert'
import Autocollapse from '../Autocollapse'
import {required, confirmation} from '@jcoreio/redux-form-validators'

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
  formControl: {
    width: '100%',
  },
  footerButton: {
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
  onCancel?: () => any,
}

const validateRetypeNewPassword = [
  required(),
  confirmation({field: 'newPassword', fieldLabel: 'New Password'}),
]

class ChangePasswordForm extends React.Component<Props> {
  render(): ?React.Node {
    const {classes, onSubmit, onCancel, submitting, valid, error} = this.props
    return (
      <form id="changePasswordForm" className={classes.root} onSubmit={onSubmit}>
        <Autocollapse>
          {error ? <ErrorAlert data-test-name="submitError">{error}</ErrorAlert> : null}
        </Autocollapse>
        <Field
          data-test-name="oldPassword"
          name="oldPassword"
          type="password"
          label="Old Password"
          component={TextField}
          className={classes.formControl}
          margin="normal"
          validate={required()}
        />
        <Field
          data-test-name="newPassword"
          name="newPassword"
          type="password"
          label="New Password"
          component={TextField}
          className={classes.formControl}
          margin="normal"
          validate={required()}
        />
        <Field
          data-test-name="retypeNewPassword"
          name="retypeNewPassword"
          type="password"
          label="Repeat New Password"
          component={TextField}
          className={classes.formControl}
          margin="normal"
          validate={validateRetypeNewPassword}
        />
        <div className={classes.footer}>
          {submitting && <Spinner />}
          <Button
            raised
            onClick={onCancel}
            className={classes.footerButton}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            raised
            color="primary"
            className={classes.footerButton}
            disabled={!valid || submitting}
          >
            Save
          </Button>
        </div>
      </form>
    )
  }
}

export default withStyles(styles, {withTheme: true})(ChangePasswordForm)

