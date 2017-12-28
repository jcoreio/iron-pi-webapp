// @flow

import * as React from 'react'
import classNames from 'classnames'
import {Link} from 'react-router-dom'
import {withStyles} from 'material-ui/styles'
import injectSheet from 'react-jss'
import Drawer from 'material-ui/Drawer'
import IconButton from 'material-ui/IconButton'
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import Collapse from 'material-ui/transitions/Collapse'

import ChevronLeftIcon from 'material-ui-icons/ChevronLeft'
import PlayArrowIcon from 'material-ui-icons/PlayArrow'
import type {ChannelMode} from '../types/Channel'

const hPadding = 22
const vPadding = 10
export const drawerWidth = 240

const styles = theme => ({
  drawerPaper: {
    position: 'relative',
    backgroundColor: theme.sidebarBackgroundColor,
    color: theme.sidebarForegroundColor,
    height: '100%',
    width: drawerWidth,
  },
  sidebarHeader: {
    borderBottomWidth: 3,
    borderBottomStyle: 'solid',
    borderBottomColor: theme.jcorePrimaryColor,
    padding: `${vPadding}px ${hPadding}px`,
    fontFamily: 'Rubik',
    fontWeight: 300,
  },
  sidebarBody: {
  },
  closeButton: {
    float: 'right',
    marginRight: -hPadding,
  },
  jcoreHeader: {
    color: theme.jcorePrimaryColor,
    fontSize: 32,
    lineHeight: '38px',
    fontWeight: 300,
    margin: 0,
    '& a': {
      '&, &:hover, &:active, &:visited, &:focus': {
        color: theme.jcorePrimaryColor,
        textDecoration: 'none',
      }
    },
  },
  ironPiHeader: {
    fontSize: 22,
    lineHeight: '27px',
    fontWeight: 300,
    margin: 0,
  },
})

type Channel = {
  id: number,
  name: string,
  mode: ChannelMode,
}

export type Props = {
  open: boolean,
  classes: Object,
  localIO?: {
    expanded?: boolean,
    channels: Array<Channel>,
  },
  onClose?: () => any,
}

class Sidebar extends React.Component<Props> {
  static defaultProps: {
    open: boolean,
  } = {
    open: false,
  }
  render(): ?React.Node {
    const {open, onClose, classes, localIO} = this.props
    return (
      <Drawer id="sidebar" open={open} type="persistent" anchor="left" classes={{paper: classes.drawerPaper}}>
        <div className={classes.sidebarHeader}>
          <h1 className={classes.jcoreHeader}>
            <Link to="/">jcore.io</Link>
            <IconButton id="closeSidebarButton" color="inherit" onClick={onClose} className={classes.closeButton}>
              <ChevronLeftIcon />
            </IconButton>
          </h1>
          <h2 className={classes.ironPiHeader}>IRON PI</h2>
        </div>
        <List className={classes.sidebarBody}>
          <SidebarSectionHeader title="Status" />
          {localIO &&
            <SidebarSection title="Local I/O" expanded={localIO.expanded}>
              {localIO.channels.map((channel: Channel) =>
                <ChannelStatus channel={channel} key={channel.id} />
              )}
            </SidebarSection>
          }
        </List>
      </Drawer>
    )
  }
}

export default withStyles(styles, {withTheme: true})(Sidebar)

const sidebarSectionHeaderStyles = {
  root: {
    height: 38,
    paddingTop: 0,
    paddingBottom: 0,
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
    transform: props => `rotate(${props.expanded ? 90 : 0}deg)`,
  },
}

export type SidebarSectionHeaderProps = {
  classes: {[name: $Keys<typeof sidebarSectionHeaderStyles>]: string},
  title: React.Node,
  expanded?: boolean,
}

const SidebarSectionHeader = injectSheet(sidebarSectionHeaderStyles)(
  ({title, classes, expanded}: SidebarSectionHeaderProps) => (
    <ListItem button className={classes.root}>
      <ListItemIcon style={{visibility: expanded != null ? 'visible' : 'hidden'}}>
        <PlayArrowIcon className={classes.expandIcon} />
      </ListItemIcon>
      <ListItemText className={classes.title} disableTypography primary={title} />
    </ListItem>
  )
)

export type SidebarSectionProps = {
  expanded?: boolean,
  title: React.Node,
  children?: React.Node,
}

const SidebarSection = (
  ({title, children, expanded}: SidebarSectionProps): React.Node => (
    <React.Fragment>
      <SidebarSectionHeader title={title} expanded={expanded} />
      <Collapse component="li" in={expanded} timeout="auto" unmountOnExit>
        <List disablePadding>
          {children}
        </List>
      </Collapse>
    </React.Fragment>
  )
)

const sidebarItemStyles = {
  root: {
    paddingLeft: 37,
    height: 30,
    paddingTop: 0,
    paddingBottom: 0,
  },
}

export type SidebarItemProps = {
  classes: Object,
  children: React.Node,
}

const SidebarItem = injectSheet(sidebarItemStyles)(
  ({classes, children}: SidebarItemProps): React.Node => (
    <ListItem button className={classes.root}>
      {children}
    </ListItem>
  )
)

const sidebarItemTextStyles = {
  root: {
    fontSize: 20,
    lineHeight: '29px',
    padding: 0,
  }
}

export type SidebarItemTextProps = {
  classes: {[name: $Keys<typeof sidebarItemTextStyles>]: string},
  className?: string,
  primary?: React.Node,
  secondary?: React.Node,
}

const SidebarItemText = injectSheet(sidebarItemTextStyles)(
  ({classes, className, primary, secondary}: SidebarItemTextProps): React.Node => (
    <ListItemText
      className={classNames(classes.root, className)}
      disableTypography
      primary={primary}
      secondary={secondary}
    />
  )
)

const channelStatusStyles = {
  id: {
    extend: sidebarItemTextStyles.root,
    marginRight: 8,
    flex: '0 1 26px',
  },
}

export type ChannelStatusProps = {
  channel: Channel,
  classes: Object,
}

const ChannelStatus = withStyles(channelStatusStyles)(
  ({channel, classes}: ChannelStatusProps): React.Node => (
    <SidebarItem>
      <SidebarItemText className={classes.id} primary={String(channel.id)} />
      <SidebarItemText disableTypography primary={channel.name} />
    </SidebarItem>
  )
)

