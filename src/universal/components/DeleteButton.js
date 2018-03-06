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
  yesButton: {
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

export type Props = {
  className?: string,
  classes: Classes,
  onArmedClick?: (e: Event) => any,
  anchorOrigin?: Origin,
  transformOrigin?: Origin,
}

export type State = {
  anchorEl: ?HTMLElement,
}

class DeleteButton extends React.Component<Props, State> {
  state: State = {anchorEl: null}

  handlePopoverOpen = e => this.setState({anchorEl: e.target})
  handlePopoverClose = e => this.setState({anchorEl: null})

  render(): ?React.Node {
    const {onArmedClick, className, classes, anchorOrigin, transformOrigin, ...props} = this.props
    const {anchorEl} = this.state
    const open = anchorEl != null
    return (
      <React.Fragment>
        <Button onClick={this.handlePopoverOpen} className={className} {...props}>
          Delete
        </Button>
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
          <h4 className={classes.popoverTitle}>Are you sure you want to delete?</h4>
          <div className={classes.buttons}>
            <Button onClick={onArmedClick} raised className={classes.yesButton}>
              Yes
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

export default withStyles(styles, {withTheme: true})(DeleteButton)
