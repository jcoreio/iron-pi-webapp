// @flow

import * as React from 'react'
import classNames from 'classnames'
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import { withStyles } from 'material-ui/styles'

import PlayArrowIcon from 'material-ui-icons/PlayArrow'
import type {Theme} from '../../theme'

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
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof sidebarSectionHeaderStyles>

export type SidebarSectionHeaderProps = {
  classes: Classes,
  title: React.Node,
  expanded?: boolean,
  onClick?: (event: MouseEvent) => any,
}

const SidebarSectionHeader = withStyles(sidebarSectionHeaderStyles, {withTheme: true})(
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