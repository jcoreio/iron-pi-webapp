// @flow

import * as React from 'react'
import classNames from 'classnames'
import injectSheet from 'react-jss'
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'

import PlayArrowIcon from 'material-ui-icons/PlayArrow'

const sidebarSectionHeaderStyles = {
  root: {
    height: 38,
    paddingTop: 0,
    paddingBottom: 0,
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
}

export type SidebarSectionHeaderProps = {
  classes: {[name: $Keys<typeof sidebarSectionHeaderStyles>]: string},
  title: React.Node,
  expanded?: boolean,
  onClick?: (event: MouseEvent) => any,
}

const SidebarSectionHeader = injectSheet(sidebarSectionHeaderStyles)(
  ({title, classes, expanded, ...props}: SidebarSectionHeaderProps) => (
    <ListItem {...props} button className={classes.root} data-test-title={title}>
      <ListItemIcon style={{visibility: expanded != null ? 'visible' : 'hidden'}}>
        <PlayArrowIcon
          className={classNames(classes.expandIcon, {
            [classes.expandIconOpen]: expanded,
          })}
        />
      </ListItemIcon>
      <ListItemText className={classes.title} disableTypography primary={title} />
    </ListItem>
  )
)

export default SidebarSectionHeader
