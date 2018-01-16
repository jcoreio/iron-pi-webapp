// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles'
import type {Theme} from '../theme'

const styles = (theme: Theme) => ({
  root: {
    display: 'inline-flex',
    flexWrap: 'wrap',
    '& > button': {
      flex: '1 1 30px',
      whiteSpace: 'pre-wrap',
      margin: 0,
      '&:not(:last-child)': {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      },
      '&:not(:first-child)': {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      },
    }
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  children: React.Node,
}

const ButtonGroup = ({classes, children, ...props}: Props) => (
  <div className={classes.root} {...props}>
    {children}
  </div>
)

export default withStyles(styles, {withTheme: true})(ButtonGroup)

