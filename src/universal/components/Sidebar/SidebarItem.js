// @flow

import * as React from 'react'
import { NavLink } from 'react-router-dom'
import ListItem from '@material-ui/core/ListItem'
import { withStyles } from '@material-ui/core/styles'
import type {Theme} from '../../theme'
import {sidebarSectionHeaderStyles} from './SidebarSectionHeader'

const sidebarItemStyles = (theme: Theme) => {
  const {spacing} = theme
  const {root, expandIcon} = sidebarSectionHeaderStyles(theme)
  return {
    root: {
      paddingLeft: root.paddingLeft + expandIcon.width + expandIcon.marginLeft + expandIcon.marginRight,
      height: 30,
      paddingTop: 0,
      paddingBottom: 0,
      paddingRight: spacing.unit * 6,
    },
    active: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      '&:focus': {
        backgroundColor: 'rgba(255,255,255,0.1)',
      },
      '&:hover': {
        backgroundColor: 'rgba(255,255,255,0.25)',
      },
    },
  }
}

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof sidebarItemStyles>

export type SidebarItemProps = {
  classes: Classes,
  children: React.Node,
}

const SidebarItem = withStyles(sidebarItemStyles, {withTheme: true})(
  ({classes, children, ...props}: SidebarItemProps): React.Node => {
    if (props.component === NavLink) (props: any).activeClassName = classes.active
    return (
      <ListItem
        {...props}
        button
        className={classes.root}
      >
        {children}
      </ListItem>
    )
  }
)

export default SidebarItem

