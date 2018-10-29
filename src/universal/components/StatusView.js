// @flow

import * as React from 'react'
import {withStyles} from '@material-ui/core/styles'
import sortBy from 'lodash.sortby'
import type {Theme} from '../theme'
import {featureComponents} from 'react-redux-features'
import {withRouter} from 'react-router-dom'

const styles = (theme: Theme) => ({

})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
}

const StatusPanels = withRouter(featureComponents({
  getComponents: feature => (feature: any).statusPanels,
  sortFeatures: features => sortBy(features, feature => feature.statusPanelsOrder),
}))

class StatusView extends React.Component<Props> {
  render(): ?React.Node {
    return (
      <div>
        <StatusPanels />
      </div>
    )
  }
}

export default withStyles(styles, {withTheme: true})(StatusView)

