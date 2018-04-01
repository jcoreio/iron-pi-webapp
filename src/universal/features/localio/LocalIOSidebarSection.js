// @flow

import * as React from 'react'
import {ListItemSecondaryAction} from 'material-ui/List'
import {withStyles} from 'material-ui/styles'

import type {Theme} from '../../theme'
import SidebarSection from '../../components/Sidebar/SidebarSection'
import ChannelStateItem from './ChannelStateItem'
import type {Channel} from './ChannelStateItem'
import Spinner from '../../components/Spinner'

const styles = (theme: Theme) => ({
  secondaryAction: {
    marginRight: theme.spacing.unit * 2,
  }
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  expanded?: boolean,
  channels?: Array<Channel>,
  loading?: boolean,
  onExpandedChange: (expanded: boolean) => any,
  classes: Classes,
}

const LocalIOSidebarSection = ({expanded, channels, onExpandedChange, loading, classes}: Props): React.Node => (
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
    onHeaderClick={() => onExpandedChange(!expanded)}
  >
    {channels && channels.map((channel: Channel) =>
      <ChannelStateItem channel={channel} key={channel.id} />
    )}
  </SidebarSection>
)

export default withStyles(styles, {withTheme: true})(LocalIOSidebarSection)

