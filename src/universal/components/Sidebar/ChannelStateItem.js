// @flow

import * as React from 'react'
import {withStyles} from 'material-ui/styles/index'
import {ListItemSecondaryAction} from 'material-ui/List'

import {sidebarItemTextStyles} from './SidebarItemText'
import SidebarItem from './SidebarItem'
import SidebarItemText from './SidebarItemText'
import type {ChannelMode, ChannelState} from '../../types/Channel'

import ChannelStateIcon from './ChannelStateIcon'
import type {Theme} from '../../theme'

export type Channel = {
  id: number,
  name: string,
  mode: ChannelMode,
  state?: ChannelState,
}

const channelStateStyles = (theme: Theme) => ({
  id: {
    extend: sidebarItemTextStyles.root,
    marginRight: theme.spacing.unit,
    flex: '0 1 26px',
  },
  name: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  secondaryAction: {
    marginTop: -theme.spacing.unit,
    marginRight: theme.spacing.unit * 3,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof channelStateStyles>

export type ChannelStateProps = {
  channel: Channel,
  classes: Classes,
}

const ChannelStateItem = withStyles(channelStateStyles, {withTheme: true})(
  ({channel, classes}: ChannelStateProps): React.Node => (
    <SidebarItem>
      <SidebarItemText data-test-name="id" className={classes.id} primary={String(channel.id)} />
      <SidebarItemText data-test-name="name" disableTypography primary={channel.name} />
      <ListItemSecondaryAction className={classes.secondaryAction}>
        <ChannelStateIcon channel={channel} />
      </ListItemSecondaryAction>
    </SidebarItem>
  )
)

export default ChannelStateItem

