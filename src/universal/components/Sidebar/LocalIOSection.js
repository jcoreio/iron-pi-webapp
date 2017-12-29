// @flow

import * as React from 'react'
import type {SectionName} from '../../redux/sidebar'

import SidebarSection from './SidebarSection'
import ChannelStateItem from './ChannelStateItem'
import type {Channel} from './ChannelStateItem'

export type Props = {
  expanded?: boolean,
  channels: Array<Channel>,
  onSectionExpandedChange: (section: SectionName, expanded: boolean) => any,
}

const LocalIOSection = ({expanded, channels, onSectionExpandedChange}: Props): React.Node => (
  <SidebarSection
    title="Local I/O"
    expanded={expanded}
    onHeaderClick={() => onSectionExpandedChange('localIO', !expanded)}
  >
    {channels.map((channel: Channel) =>
      <ChannelStateItem channel={channel} key={channel.id} />
    )}
  </SidebarSection>
)

export default LocalIOSection


