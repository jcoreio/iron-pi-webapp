// @flow

import * as React from 'react'
import classNames from 'classnames'
import {Link} from 'react-router-dom'
import {withStyles} from 'material-ui/styles'
import IconButton from 'material-ui/IconButton'
import List from 'material-ui/List'

import ChevronLeftIcon from 'material-ui-icons/ChevronLeft'
import type {SectionName} from '../../redux/sidebar'

import SidebarSectionHeader from './SidebarSectionHeader'
import LocalIOSection from './LocalIOSection'
import type {Channel} from './ChannelStateItem'
import type {Theme} from '../../theme'

const styles = ({jcorePrimaryColor, sidebar, zIndex}: Theme) => ({
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: sidebar.width,
    backgroundColor: sidebar.backgroundColor,
    color: sidebar.foregroundColor,
    transition: {
      ...sidebar.transition,
      property: 'left',
    },
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

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  open: ?boolean,
  classes: Classes,
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
          {localIO && <LocalIOSection {...localIO} onSectionExpandedChange={onSectionExpandedChange} />}
        </List>
      </div>
    )
  }
}

export default withStyles(styles, {withTheme: true})(Sidebar)

