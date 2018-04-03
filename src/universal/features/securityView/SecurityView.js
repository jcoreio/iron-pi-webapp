// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'
import type {Theme} from '../../theme'
import ViewPanel, {ViewPanelTitle} from '../../components/ViewPanel'
import SSHToggleContainer from './SSHToggleContainer'
import ChangePasswordFormContainer from '../../components/ChangePassword/ChangePasswordFormContainer'

const styles = (theme: Theme) => ({

})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
}

class SecurityView extends React.Component<Props> {
  render(): ?React.Node {
    return (
      <ViewPanel>
        <ViewPanelTitle>Change Password</ViewPanelTitle>
        <ChangePasswordFormContainer />
        <ViewPanelTitle>SSH Access</ViewPanelTitle>
        <SSHToggleContainer />
      </ViewPanel>
    )
  }
}

export default withStyles(styles, {withTheme: true})(SecurityView)

