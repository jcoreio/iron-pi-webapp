// @flow

import * as React from 'react'
import {NavLink} from 'react-router-dom'
import {withStyles} from 'material-ui/styles/index'
import {ListItemSecondaryAction} from 'material-ui/List'

import {sidebarItemTextStyles} from '../../components/Sidebar/SidebarItemText'
import SidebarItem from '../../components/Sidebar/SidebarItem'
import SidebarItemText from '../../components/Sidebar/SidebarItemText'

import type {ChannelMode} from '../../localio/LocalIOChannel'

import ChannelStateIcon from './ChannelStateIcon'
import type {Theme} from '../../theme'
import {channelForm} from './routePaths'

export type Channel = {
  id: number,
  name: string,
  state?: {
    mode: ChannelMode,
    systemValue?: ?number,
  },
  metadataItem?: {
    min?: number,
    max?: number,
  },
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
    <SidebarItem component={NavLink} to={channelForm(channel.id + 1)} data-component="ChannelStateItem">
      <SidebarItemText data-test-name="id" className={classes.id} primary={String(channel.id + 1)} />
      <SidebarItemText data-test-name="name" disableTypography primary={channel.name} className={classes.name} />
      <ListItemSecondaryAction className={classes.secondaryAction}>
        <ChannelStateIcon channel={channel} />
      </ListItemSecondaryAction>
    </SidebarItem>
  )
)

export default ChannelStateItem

