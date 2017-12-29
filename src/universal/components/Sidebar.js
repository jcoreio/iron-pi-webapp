// @flow

import * as React from 'react'
import classNames from 'classnames'
import {Link} from 'react-router-dom'
import {withStyles} from 'material-ui/styles'
import injectSheet from 'react-jss'
import IconButton from 'material-ui/IconButton'
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List'
import Collapse from 'material-ui/transitions/Collapse'


import ChevronLeftIcon from 'material-ui-icons/ChevronLeft'
import PlayArrowIcon from 'material-ui-icons/PlayArrow'
import type {ChannelMode} from '../types/Channel'
import type {SectionName} from '../redux/sidebar'

const styles = ({jcorePrimaryColor, sidebar, zIndex}) => ({
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: sidebar.width,
    backgroundColor: sidebar.backgroundColor,
    color: sidebar.foregroundColor,
    transition: sidebar.transition,
    zIndex: zIndex.navDrawer,
  },
  sidebarOpen: {
    left: 0,
  },
  sidebarClosed: {
    left: -sidebar.width,
  },
  sidebarAuto: {
    [`@media (max-width: ${sidebar.autoOpenBreakpoint() - 1}px)`]: {
      left: -sidebar.width,
    },
    [`@media (min-width: ${sidebar.autoOpenBreakpoint()}px)`]: {
      left: 0,
    },
  },
  sidebarHeader: {
    borderBottomWidth: 3,
    borderBottomStyle: 'solid',
    borderBottomColor: jcorePrimaryColor,
    padding: `${sidebar.padding.vertical}px ${sidebar.padding.horizontal}px`,
    fontFamily: 'Rubik',
    fontWeight: 300,
  },
  sidebarBody: {
  },
  closeButton: {
    float: 'right',
    marginRight: -sidebar.padding.horizontal,
  },
  jcoreHeader: {
    color: jcorePrimaryColor,
    fontSize: 32,
    lineHeight: '38px',
    fontWeight: 300,
    margin: 0,
    '& a': {
      '&, &:hover, &:active, &:visited, &:focus': {
        color: jcorePrimaryColor,
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
  open: ?boolean,
  classes: Object,
  localIO?: {
    expanded?: boolean,
    channels: Array<Channel>,
  },
  onClose?: () => any,
  onSectionExpandedChange: (section: SectionName, expanded: boolean) => any,
}

class Sidebar extends React.Component<Props> {
  static defaultProps: {
    open: boolean,
    onSectionExpandedChange: (section: SectionName, expanded: boolean) => any,
  } = {
    open: false,
    onSectionExpandedChange: () => {},
  }

  render(): ?React.Node {
    const {open, onClose, onSectionExpandedChange, classes, localIO} = this.props
    return (
      <div
        id="sidebar"
        type="persistent"
        anchor="left"
        className={classNames(classes.sidebar, {
          [classes.sidebarOpen]: open,
          [classes.sidebarClosed]: open === false,
          [classes.sidebarAuto]: open == null,
        })}
      >
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
            <SidebarSection
              title="Local I/O"
              expanded={localIO.expanded}
              onHeaderClick={() => onSectionExpandedChange('localIO', !localIO.expanded)}
            >
              {localIO.channels.map((channel: Channel) =>
                <ChannelStatus channel={channel} key={channel.id} />
              )}
            </SidebarSection>
          }
        </List>
      </div>
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
    transform: 'rotate(0deg)',
  },
  expandIconOpen: {
    transform: 'rotate(90deg)',
  },
}

export type SidebarSectionHeaderProps = {
  classes: {[name: $Keys<typeof sidebarSectionHeaderStyles>]: string},
  title: React.Node,
  expanded?: boolean,
  onClick?: (event: MouseEvent) => any,
}

const SidebarSectionHeader = injectSheet(sidebarSectionHeaderStyles)(
  ({title, classes, expanded, onClick}: SidebarSectionHeaderProps) => (
    <ListItem button className={classes.root} onClick={onClick}>
      <ListItemIcon style={{visibility: expanded != null ? 'visible' : 'hidden'}}>
        <PlayArrowIcon
          className={classNames(classes.expandIcon, {
            [classes.expandIconOpen]: expanded,
          })}
        />
      </ListItemIcon>
      <ListItemText className={classes.title} disableTypography primary={title} />
    </ListItem>
  )
)

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

