// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'
import type {Theme} from '../../theme'
import _ChevronRight from 'material-ui-icons/ChevronRight'

const styles = (theme: Theme) => ({
  root: {
    width: theme.typography.pxToRem(32),
    height: theme.typography.pxToRem(32),
    verticalAlign: 'middle',
    color: '#747f88',
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
}

const ChevronRight = ({classes}: Props) => (
  <_ChevronRight className={classes.root} viewBox="4 5 16 16" />
)

export default withStyles(styles, {withTheme: true})(ChevronRight)

