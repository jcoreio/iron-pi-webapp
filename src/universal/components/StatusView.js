// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'
import type {Theme} from '../theme'

const styles = (theme: Theme) => ({

})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
}

class StatusView extends React.Component<Props> {
  render(): ?React.Node {
    const {classes} = this.props
    return <div {...this.props} />
  }
}

export default withStyles(styles, {withTheme: true})(StatusView)

