// @flow

import * as React from 'react'
import {Link} from 'react-router-dom'
import {withStyles} from 'material-ui/styles'
import List, {ListItem, ListItemText, ListItemSecondaryAction} from 'material-ui/List'

import type {Theme} from '../../theme'
import StatusPanel, {StatusPanelTitle} from '../../components/StatusPanel'

import type {ChannelMode} from '../../localio/LocalIOChannel'

import ChannelStateIcon from './ChannelStateIcon'
import {channelForm} from './routePaths'
import ValueBlock from '../../components/ValueBlock'

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
    units?: string,
    displayPrecision?: number,
  },
}

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
  onExpandedChange: (expanded: boolean) => any,
  classes: Classes,
}

const LocalIOStatusPanel = ({expanded, channels, onExpandedChange, loading, classes}: Props): React.Node => (
  <StatusPanel>
    <StatusPanelTitle>Local I/O</StatusPanelTitle>
    <List>
      <ChannelStateHeader />
      {channels && channels.map((channel: Channel) =>
        <ChannelStateItem channel={channel} key={channel.id} />
      )}
    </List>
  </StatusPanel>
)

export default withStyles(styles, {withTheme: true})(LocalIOStatusPanel)


const channelStateStyles = (theme: Theme) => {
  const itemTextStyles = {
    fontSize: theme.typography.pxToRem(22),
    lineHeight: theme.typography.pxToRem(27),
    padding: 0,
  }
  return {
    id: {
      extend: itemTextStyles,
      marginRight: theme.spacing.unit,
      flex: `0 1 ${theme.spacing.unit * 5}px`,
    },
    name: {
      extend: itemTextStyles,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontWeight: 400,
      flex: '1 1 140px',
    },
    secondaryAction: {
      marginTop: -theme.spacing.unit * 1.5,
      marginRight: theme.spacing.unit * 3,
      flex: '0 0 150px',
      textAlign: 'center',
    },
    channelStateIcon: {
      width: theme.spacing.unit * 4,
      height: theme.spacing.unit * 2.5,
    },
    channelStateIconAnalogInput: {
      width: theme.spacing.unit * 12,
    },
    channelStateIconOutput: {
      width: theme.spacing.unit * 3,
      height: theme.spacing.unit * 3,
    },
    root: {
      padding: `${theme.spacing.unit}px ${theme.spacing.unit * 3}px`,
    },
    container: {
      transition: 'background-color ease 0.1s',
      '&:nth-child(odd)': {
        backgroundColor: theme.palette.grey[200],
      },
      '&:nth-child(even)': {
        backgroundColor: theme.palette.grey[50],
      },
      '&:hover': {
        backgroundColor: theme.palette.grey[300],
      },
    },
    valueBlock: {
      height: theme.spacing.unit * 3,
      width: 122,
    },

  }
}

type ChannelStateClasses = $Call<ExtractClasses, typeof channelStateStyles>

export type ChannelStateProps = {
  channel: Channel,
  classes: ChannelStateClasses,
}

function getValueBlockProps(channel: Channel): {value: ?string, units: ?string} {
  const {state, metadataItem} = channel
  const units = metadataItem ? metadataItem.units : null
  let value = 'NA'
  if (state) {
    const systemValue = state.systemValue || NaN
    if (Number.isFinite(systemValue)) {
      if (metadataItem) {
        const displayPrecision = metadataItem.displayPrecision || 0
        value = systemValue.toFixed(displayPrecision)
      }
    }
  }
  return {value, units}
}

const StyledChannelStateItem = ({channel, classes}: ChannelStateProps): React.Node => (
  <ListItem
    component={Link}
    button
    to={channelForm(channel.id + 1)}
    classes={{
      container: classes.container,
      root: classes.root,
    }}
    data-component="ChannelStateItem"
  >
    <ListItemText data-test-name="id" disableTypography className={classes.id} primary={String(channel.id + 1)} />
    <ListItemText data-test-name="name" disableTypography primary={channel.name} className={classes.name} />
    <ListItemText disableTypography
      primary={
        <ValueBlock
          className={classes.valueBlock}
          {...getValueBlockProps(channel)}
        />
      }
    />
    <ListItemSecondaryAction className={classes.secondaryAction}>
      <ChannelStateIcon
        channel={channel}
        classes={{
          root: classes.channelStateIcon,
          rootAnalogInput: classes.channelStateIconAnalogInput,
          rootOutput: classes.channelStateIconOutput,
        }}
      />
    </ListItemSecondaryAction>
  </ListItem>
)

const ChannelStateItem = withStyles(channelStateStyles, {withTheme: true})(StyledChannelStateItem)

const channelStateHeaderStyles = (theme: Theme) => ({
  header: {
    padding: 0,
    paddingBottom: theme.spacing.unit * 0.5,
  },
  headerId: {
    fontSize: theme.typography.pxToRem(14),
    lineHeight: theme.typography.pxToRem(17),
    color: theme.palette.grey[700],
    flex: `0 0 ${theme.spacing.unit * 5}px`,
  },
  headerName: {
    extend: 'headerId',
    textAlign: 'left',
  },
})

type ChannelStateHeaderClasses = $Call<ExtractClasses, typeof channelStateHeaderStyles>

export type StyledChannelStateHeaderProps = {
  classes: ChannelStateHeaderClasses,
}

const StyledChannelStateHeader = ({classes}: StyledChannelStateHeaderProps): React.Node => (
  <ListItem className={classes.header}>
    <ListItemText disableTypography className={classes.headerId} primary="Channel" />
    <ListItemText disableTypography className={classes.headerName} primary="Name" />
  </ListItem>
)
const ChannelStateHeader = withStyles(channelStateHeaderStyles, {withTheme: true})(StyledChannelStateHeader)

