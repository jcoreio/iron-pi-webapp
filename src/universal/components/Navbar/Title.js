// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles} from 'material-ui/styles'
import type {Theme} from '../../theme'

const styles = ({navbar}: Theme) => ({
  root: {
    ...navbar.title,
    '& > a': {
      textDecoration: 'none',
      color: navbar.title.color,
    }
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  classes: Classes,
  className?: string,
  children: React.Node,
}

const Title = ({classes, className, children, ...props}: Props) => (
  <div className={classNames(classes.root, className)} {...props}>
    {children}
  </div>
)

export default withStyles(styles, {withTheme: true})(Title)

