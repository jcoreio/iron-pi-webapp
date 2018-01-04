// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles} from 'material-ui/styles'
import type {Theme} from '../../theme'

const styles = (theme: Theme) => ({
  root: {
    textAlign: 'center',
    fontSize: '1.125rem',
    color: theme.palette.grey[600],
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  className?: string,
}

const DisabledChannelState = withStyles(styles, {withTheme: true})(
  ({classes, className}: Props) => (
    <div className={classNames(classes.root, className)}>
      Channel is disabled
    </div>
  )
)

export default DisabledChannelState

