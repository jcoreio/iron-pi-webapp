// @flow

import * as React from 'react'
import {withStyles} from '@material-ui/core/styles'
import type {Theme} from '../../theme'
import _ChevronRight from 'material-ui-icons/ChevronRight'

const styles = ({spacing, typography}: Theme) => ({
  root: {
    width: typography.pxToRem(32),
    height: typography.pxToRem(32),
    verticalAlign: 'middle',
    color: '#747f88',
    margin: `0 ${spacing.unit}px`,
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

