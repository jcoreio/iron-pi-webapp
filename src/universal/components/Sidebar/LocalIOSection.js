// @flow

import * as React from 'react'
import {ListItemSecondaryAction} from 'material-ui/List'
import {withStyles} from 'material-ui/styles'

import type {Theme} from '../../theme'
import type {SectionName} from '../../redux/sidebar'
import SidebarSection from './SidebarSection'
import ChannelStateItem from './ChannelStateItem'
import type {Channel} from './ChannelStateItem'
import Spinner from '../Spinner'

const styles = (theme: Theme) => ({
  secondaryAction: {
    marginTop: -theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
  }
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  expanded?: boolean,
  channels?: Array<Channel>,
  loading?: boolean,
  onSectionExpandedChange: (section: SectionName, expanded: boolean) => any,
  classes: Classes,
}

const LocalIOSection = ({expanded, channels, onSectionExpandedChange, loading, classes}: Props): React.Node => (
  <SidebarSection
    title="Local I/O"
    headerProps={{
      children: (
        <ListItemSecondaryAction className={classes.secondaryAction}>
          <Spinner in={loading} />
        </ListItemSecondaryAction>
      )
    }}
    expanded={expanded}
    onHeaderClick={() => onSectionExpandedChange('localIO', !expanded)}
  >
    {channels && channels.map((channel: Channel) =>
      <ChannelStateItem channel={channel} key={channel.id} />
    )}
  </SidebarSection>
)

export default withStyles(styles, {withTheme: true})(LocalIOSection)

