// @flow

import * as React from 'react'
import classNames from 'classnames'
import injectSheet from 'react-jss'
import ListItemText from '@material-ui/core/ListItemText'

export const sidebarItemTextStyles = {
  root: {
    fontSize: 20,
    lineHeight: '29px',
    padding: 0,
  }
}

export type SidebarItemTextProps = {
  classes: {[name: $Keys<typeof sidebarItemTextStyles>]: string},
  className?: string,
  primary?: React.Node,
  secondary?: React.Node,
}

const SidebarItemText = injectSheet(sidebarItemTextStyles)(
  ({classes, className, primary, secondary, ...props}: SidebarItemTextProps): React.Node => (
    <ListItemText
      {...props}
      className={classNames(classes.root, className)}
      disableTypography
      primary={primary}
      secondary={secondary}
    />
  )
)

export default SidebarItemText

