// @flow

import * as React from 'react'
import List from 'material-ui/List'
import Collapse from 'material-ui/transitions/Collapse'

import SidebarSectionHeader from './SidebarSectionHeader'

export type SidebarSectionProps = {
  expanded?: boolean,
  title: React.Node,
  children?: React.Node,
  onHeaderClick?: (event: MouseEvent) => any,
}

const SidebarSection = (
  ({title, children, expanded, onHeaderClick}: SidebarSectionProps): React.Node => (
    <React.Fragment>
      <SidebarSectionHeader title={title} expanded={expanded} onClick={onHeaderClick} />
      <Collapse component="li" in={expanded} timeout="auto" unmountOnExit>
        <List disablePadding data-test-title={title}>
          {children}
        </List>
      </Collapse>
    </React.Fragment>
  )
)

export default SidebarSection

