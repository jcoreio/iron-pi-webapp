// @flow

import * as React from 'react'
import {compose} from 'redux'
import {Field} from 'redux-form-normalize-on-blur'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'
import Typography from 'material-ui/Typography'
import {required} from 'redux-form-validators'

import type {Theme} from '../../theme'
import ViewPanel, {ViewPanelTitle, ViewPanelBody} from '../../components/ViewPanel'
import TextField from '../../components/TextField'

import SubmitStatus from '../../components/SubmitStatus'

import {formValues} from 'redux-form'

const styles = ({spacing}: Theme) => ({
  form: {
    margin: '0 auto',
    minWidth: 570 + spacing.unit * 4,
    maxWidth: 570 + spacing.unit * 4,
  },
  formControl: {
    marginTop: spacing.unit,
    marginBottom: spacing.unit,
    width: '100%',
  },
  buttons: {
    textAlign: 'right',
    marginTop: spacing.unit * 2,
    '& > button': {
      minWidth: 120,
    },
    '& > :not(:last-child)': {
      marginRight: spacing.unit * 3,
    }
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  initialized?: boolean,
  submitting?: boolean,
  submitSucceeded?: boolean,
  submitFailed?: boolean,
  pristine?: boolean,
  error?: string,
  change?: (field: string, newValue: any) => any,
  onSubmit?: (e: Event) => any,
  onCancel?: (e: MouseEvent) => any,
}

class EnableSSHForm extends React.Component<Props> {
  render(): React.Node {
    const {
      classes, pristine,
      submitting, submitSucceeded, submitFailed, error,
      onSubmit, onCancel,
    } = this.props
    return (
      <form id="EnableSSHForm" className={classes.form} onSubmit={onSubmit}>
        <ViewPanel>
          <ViewPanelTitle>
            Enable SSH
          </ViewPanelTitle>
          <ViewPanelBody>
            <Typography variant="subheading">
              Enter the password to enable SSH:
            </Typography>
            <Field
              name="password"
              type="password"
              component={TextField}
              className={classes.formControl}
              validate={required()}
            />
            <SubmitStatus
              submitting={submitting}
              submitSucceeded={submitSucceeded}
              submitFailed={submitFailed}
              error={error}
            />
            <div className={classes.buttons}>
              <Button
                variant="raised"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="raised"
                color="primary"
                disabled={pristine || submitting}
              >
                Enable SSH
              </Button>
            </div>
          </ViewPanelBody>
        </ViewPanel>
      </form>
    )
  }
}

export default compose(
  withStyles(styles, {withTheme: true}),
  formValues('mode')
)(EnableSSHForm)

