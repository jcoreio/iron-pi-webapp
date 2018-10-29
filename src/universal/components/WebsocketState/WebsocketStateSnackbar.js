// @flow

import * as React from 'react'
import {withStyles} from '@material-ui/core/styles'
import type {Theme} from '../../theme'
import Snackbar from '@material-ui/core/Snackbar'
import SuccessAlert from '../SuccessAlert'
import WarningIcon from '@material-ui/icons/Warning'
import type {WebsocketState} from '../../apollo/websocketRedux'

const styles = (theme: Theme) => ({
  icon: {
    verticalAlign: 'middle',
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  websocketState: WebsocketState,
  classes: Classes,
}

class WebsocketStateSnackbar extends React.Component<Props> {
  render(): ?React.Node {
    const {websocketState, classes} = this.props
    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={websocketState !== 'connected' && websocketState !== 'connecting'}
        message={
          websocketState === 'connected'
            ? <SuccessAlert>Connected to server!</SuccessAlert>
            : <span><WarningIcon className={classes.icon} /> Lost connection to device. Attempting to reconnect...</span>
        }
      />
    )
  }
}

export default withStyles(styles, {withTheme: true})(WebsocketStateSnackbar)

