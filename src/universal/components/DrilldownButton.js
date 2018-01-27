// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'
import ChevronRight from 'material-ui-icons/ChevronRight'

import type {Theme} from '../theme'

const styles = ({spacing}: Theme) => ({
  icon: {
    float: 'right',
    marginLeft: spacing.unit,
  }
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  children?: React.Node,
}

const DrilldownButton = withStyles(styles, {withTheme: true})(
  ({classes, children, theme, ...props}: Props) => (
    <Button {...props}>
      {children}
      <ChevronRight className={classes.icon} />
    </Button>
  )
)

export default DrilldownButton
