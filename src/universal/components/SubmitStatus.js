// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'
import type {Theme} from '../theme'
import Fader from './Fader'
import Spinner from './Spinner'
import ErrorAlert from './ErrorAlert'
import SuccessAlert from './SuccessAlert'

const styles = ({spacing}: Theme) => ({
  root: {
    marginTop: spacing.unit * 2,
    marginBottom: spacing.unit * 2,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  submitting?: boolean,
  submittingText?: React.Node,
  error?: string,
  submitFailed?: boolean,
  submitFailedText?: React.Node,
  submitSucceeded?: boolean,
  submitSucceededText?: React.Node,
}

type State = {
  showSuccess: boolean,
}

class SubmitStatus extends React.Component<Props, State> {
  state: State = {showSuccess: Boolean(this.props.submitSucceeded && !this.props.submitting)}

  hideSuccessTimeout: ?any = null

  showSuccess = () => {
    if (this.hideSuccessTimeout != null) clearTimeout(this.hideSuccessTimeout)
    this.setState({showSuccess: true})
    this.hideSuccessTimeout = setTimeout(() => this.setState({showSuccess: false}), 5000)
  }

  componentDidMount() {
    if (this.props.submitSucceeded && !this.props.submitting) this.showSuccess()
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.submitSucceeded && !nextProps.submitting && this.props.submitting) {
      this.showSuccess()
    }
  }

  componentWillUnmount() {
    if (this.hideSuccessTimeout != null) clearTimeout(this.hideSuccessTimeout)
  }

  render(): ?React.Node {
    const {
      classes,
      submitting,
      submittingText,
      submitFailed,
      submitFailedText,
      submitSucceeded,
      submitSucceededText,
      error,
      ...props
    } = this.props
    const {showSuccess} = this.state

    let content = null
    if (submitting) {
      content = <span key="submitting" data-status="submitting"><Spinner /> {submittingText || 'Saving...'}</span>
    }
    else if (submitFailed) {
      content = (
        <ErrorAlert key="submitFailed" data-status="submitFailed">
          {submitFailedText || 'Failed to save changes:'} {error || 'please correct the values highlighted in red above.'}
        </ErrorAlert>
      )
    }
    else if (submitSucceeded && showSuccess) {
      content = (
        <SuccessAlert key="submitSucceeded" data-status="submitSucceeded">
          {submitSucceededText || 'Your changes have been saved!'}
        </SuccessAlert>
      )
    }
    return (
      <div className={classes.root}>
        <Fader animateHeight {...props}>
          {content}
        </Fader>
      </div>
    )
  }
}

export default withStyles(styles, {withTheme: true})(SubmitStatus)

