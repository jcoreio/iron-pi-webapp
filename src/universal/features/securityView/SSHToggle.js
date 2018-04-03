// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'
import Popover from 'material-ui/Popover'
import Button from 'material-ui/Button'
import type {Theme} from '../../theme'
import RadioButtonGroup from '../../components/RadioButtonGroup'
import ControlWithInfo from '../../components/ControlWithInfo'

const styles = ({spacing, palette}: Theme) => ({
  popoverPaper: {
    padding: spacing.unit * 2,
    textAlign: 'center',
  },
  popoverTitle: {
    marginTop: 0,
  },
  radioButton: {
    maxWidth: 120,
  },
  popoverButtons: {
    '& > :not(:first-child)': {
      marginLeft: spacing.unit,
    }
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  onChange?: (sshEnabled: boolean) => any,
  sshEnabled?: boolean,
}

export type State = {
  anchorEl: ?HTMLElement,
  actionToConfirm: 'enable' | 'disable',
}

class ConfirmDeletePopover extends React.Component<Props, State> {
  state: State = {anchorEl: null, actionToConfirm: 'enable'}

  handleChange = (sshEnabled: ?boolean, e: Event) => {
    if (this.props.sshEnabled === sshEnabled) return
    this.setState({
      anchorEl: (e.target: any),
      actionToConfirm: sshEnabled ? 'enable' : 'disable',
    })
  }
  handlePopoverClose = () => this.setState({anchorEl: null})
  handleConfirmClick = () => {
    const {actionToConfirm} = this.state
    this.setState({anchorEl: null})
    const {onChange} = this.props
    if (onChange) onChange(actionToConfirm === 'enable')
  }

  render(): ?React.Node {
    const {classes, sshEnabled} = this.props
    const {anchorEl, actionToConfirm} = this.state
    const open = anchorEl != null
    return (
      <React.Fragment>
        <ControlWithInfo info="TODO">
          <RadioButtonGroup
            onChange={this.handleChange}
            value={sshEnabled}
            availableValues={[false, true]}
            getDisplayText={sshEnabled => sshEnabled ? 'SSH Enabled' : 'SSH Disabled'}
            classes={{button: classes.radioButton}}
          />
        </ControlWithInfo>
        <Popover
          open={open}
          classes={{
            paper: classes.popoverPaper,
          }}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'center',
            horizontal: 'left',
          }}
          onClose={this.handlePopoverClose}
          disableRestoreFocus
        >
          <h4 className={classes.popoverTitle}>
            Are you sure you want to {actionToConfirm} SSH?
          </h4>
          <div className={classes.popoverButtons}>
            <Button onClick={this.handlePopoverClose} variant="raised">
              Cancel
            </Button>
            <Button onClick={this.handleConfirmClick} variant="raised" color="primary">
              OK
            </Button>
          </div>
        </Popover>
      </React.Fragment>
    )
  }
}

export default withStyles(styles, {withTheme: true})(ConfirmDeletePopover)
