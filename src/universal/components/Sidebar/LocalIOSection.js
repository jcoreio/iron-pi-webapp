// @flow

import * as React from 'react'
import type {SectionName} from '../../redux/sidebar'

import SidebarSection from './SidebarSection'
import ChannelStatusItem from './ChannelStatusItem'
import type {Channel} from './ChannelStatusItem'

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
      <ChannelStatusItem channel={channel} key={channel.id} />
    )}
  </SidebarSection>
)

export default LocalIOSection


