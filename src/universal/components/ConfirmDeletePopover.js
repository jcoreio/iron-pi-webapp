// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'
import Popover from 'material-ui/Popover'
import Button from 'material-ui/Button'
import type {Theme} from '../theme'

const styles = ({spacing, palette}: Theme) => ({
  popoverPaper: {
    padding: spacing.unit * 2,
    textAlign: 'center',
  },
  popoverTitle: {
    marginTop: 0,
  },
  buttons: {
    '& > :not(:first-child)': {
      marginLeft: spacing.unit,
    }
  },
  deleteButton: {
    backgroundColor: palette.error[500],
    color: 'white',
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

type Origin = {
  vertical: 'top' | 'center' | 'bottom',
  horizontal: 'left' | 'center' | 'right',
}

type ChildProps = {
  bind: {
    onClick: (event: Event) => any,
  },
}

export type Props = {
  className?: string,
  classes: Classes,
  confirmationMessage?: React.Node,
  onConfirmDelete?: () => any,
  anchorOrigin?: Origin,
  transformOrigin?: Origin,
  children: (props: ChildProps) => React.Node,
}

export type State = {
  anchorEl: ?HTMLElement,
}

class ConfirmDeletePopover extends React.Component<Props, State> {
  state: State = {anchorEl: null}

  handlePopoverOpen = e => this.setState({anchorEl: (e.target: any)})
  handlePopoverClose = () => this.setState({anchorEl: null})
  handleConfirmClick = () => {
    this.setState({anchorEl: null})
    const {onConfirmDelete} = this.props
    if (onConfirmDelete) onConfirmDelete()
  }

  render(): ?React.Node {
    const {confirmationMessage, classes, anchorOrigin, transformOrigin, children} = this.props
    const {anchorEl} = this.state
    const open = anchorEl != null
    return (
      <React.Fragment>
        {children({bind: {onClick: this.handlePopoverOpen}})}
        <Popover
          open={open}
          classes={{
            paper: classes.popoverPaper,
          }}
          anchorEl={anchorEl}
          anchorOrigin={anchorOrigin || {
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={transformOrigin || {
            vertical: 'top',
            horizontal: 'center',
          }}
          onClose={this.handlePopoverClose}
          disableRestoreFocus
        >
          <h4 className={classes.popoverTitle}>
            {confirmationMessage || 'Are you sure?'}
          </h4>
          <div className={classes.buttons}>
            <Button onClick={this.handleConfirmClick} raised className={classes.deleteButton}>
              Delete
            </Button>
            <Button onClick={this.handlePopoverClose} raised>
              Cancel
            </Button>
          </div>
        </Popover>
      </React.Fragment>
    )
  }
}

export default withStyles(styles, {withTheme: true})(ConfirmDeletePopover)
