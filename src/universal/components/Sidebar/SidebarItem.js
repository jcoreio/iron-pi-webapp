// @flow

import * as React from 'react'
import injectSheet from 'react-jss'
import { ListItem } from 'material-ui/List'

const sidebarItemStyles = {
  root: {
    paddingLeft: 37,
    height: 30,
    paddingTop: 0,
    paddingBottom: 0,
  },
}

export type SidebarItemProps = {
  classes: {[name: $Keys<typeof sidebarItemStyles>]: string},
  children: React.Node,
}

const SidebarItem = injectSheet(sidebarItemStyles)(
  ({classes, children, ...props}: SidebarItemProps): React.Node => (
    <ListItem {...props} button className={classes.root}>
      {children}
    </ListItem>
  )
)

export default SidebarItem

