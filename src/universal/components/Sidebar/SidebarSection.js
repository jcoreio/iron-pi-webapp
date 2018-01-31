// @flow

import * as React from 'react'
import List from 'material-ui/List'
import Collapse from 'material-ui/transitions/Collapse'

import SidebarSectionHeader from './SidebarSectionHeader'

export type SidebarSectionProps = {
  expanded?: boolean,
  title: string,
  children?: React.Node,
  onHeaderClick?: (event: MouseEvent) => any,
  headerProps?: $Shape<React.ElementProps<typeof SidebarSectionHeader>>,
}

const SidebarSection = (
  ({title, children, expanded, onHeaderClick, headerProps}: SidebarSectionProps): React.Node => (
    <React.Fragment>
      <SidebarSectionHeader
        title={title}
        expanded={expanded}
        onClick={onHeaderClick}
        {...headerProps || {}}
      />
      <Collapse component="li" in={expanded} timeout="auto" unmountOnExit>
        <List component="div" disablePadding data-test-title={title} data-component="List">
          {children}
        </List>
      </Collapse>
    </React.Fragment>
  )
)

export default SidebarSection

