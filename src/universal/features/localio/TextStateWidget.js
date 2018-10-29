// @flow

import * as React from 'react'
import classNames from 'classnames'
import {withStyles} from '@material-ui/core/styles'
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
  children?: React.Node,
}

const TextStateWidget = withStyles(styles, {withTheme: true})(
  ({classes, className, children, ...props}: Props) => (
    <div className={classNames(classes.root, className)} {...props}>
      {children}
    </div>
  )
)

export default TextStateWidget

