// @flow

import * as React from 'react'
import { ListItem } from 'material-ui/List'
import { withStyles } from 'material-ui/styles'
import type {Theme} from '../../theme'

const sidebarItemStyles = (theme: Theme) => ({
  root: {
    paddingLeft: 37,
    height: 30,
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: theme.spacing.unit * 6,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof sidebarItemStyles>

export type SidebarItemProps = {
  classes: Classes,
  children: React.Node,
}

const SidebarItem = withStyles(sidebarItemStyles, {withTheme: true})(
  ({classes, children, ...props}: SidebarItemProps): React.Node => (
    <ListItem {...props} button className={classes.root}>
      {children}
    </ListItem>
  )
)

export default SidebarItem

