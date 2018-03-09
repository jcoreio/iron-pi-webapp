// @flow

import * as React from 'react'
import classNames from 'classnames'
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import { withStyles } from 'material-ui/styles'

import PlayArrowIcon from 'material-ui-icons/PlayArrow'
import type {Theme} from '../../theme'
import {NavLink} from 'react-router-dom'

const sidebarSectionHeaderStyles = (theme: Theme) => ({
  root: {
    height: 38,
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: theme.spacing.unit * 6,
  },
  title: {
    fontSize: 21,
    fontWeight: 500,
    padding: 0,
    textTransform: 'uppercase',
  },
  expandIcon: {
    color: '#7A8995',
    width: 20,
    marginLeft: -4,
    marginRight: 5,
    transition: 'transform ease 200ms',
    transform: 'rotate(0deg)',
  },
  expandIconOpen: {
    transform: 'rotate(90deg)',
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
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof sidebarSectionHeaderStyles>

export type SidebarSectionHeaderProps = {
  classes: Classes,
  title: string,
  expanded?: boolean,
  onClick?: (event: MouseEvent) => any,
  children?: React.Node,
  component?: React.ComponentType<any>,
}

const SidebarSectionHeader = withStyles(sidebarSectionHeaderStyles, {withTheme: true})(
  ({title, classes, expanded, children, ...props}: SidebarSectionHeaderProps) => (
    <ListItem
      {...props}
      button
      className={classes.root}
      data-test-title={title}
      activeClassName={props.component === NavLink ? classes.active : undefined}
    >
      <ListItemIcon style={{visibility: expanded != null ? 'visible' : 'hidden'}}>
        <PlayArrowIcon
          className={classNames(classes.expandIcon, {
            [classes.expandIconOpen]: expanded,
          })}
        />
      </ListItemIcon>
      <ListItemText className={classes.title} disableTypography primary={title} />
      {children}
    </ListItem>
  )
)

export default SidebarSectionHeader
