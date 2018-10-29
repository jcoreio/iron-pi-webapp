// @flow

import * as React from 'react'
import classNames from 'classnames'
import {Link, NavLink, withRouter} from 'react-router-dom'
import sortBy from 'lodash.sortby'
import {featureComponents} from 'react-redux-features'
import {withStyles} from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import List from '@material-ui/core/List'

import ChevronLeftIcon from 'material-ui-icons/ChevronLeft'

import SidebarSectionHeader from './SidebarSectionHeader'
import type {Theme} from '../../theme'
import {STATUS} from '../../react-router/paths'

const styles = ({palette: {background, secondary}, sidebar, jcoreLogo, ironPiLogo, zIndex}: Theme) => ({
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: sidebar.width,
    backgroundColor: background.sidebar,
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
    borderBottom: {
      style: 'solid',
      width: 3,
      color: secondary[500],
    },
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
    ...jcoreLogo,
    margin: 0,
    '& a': {
      '&, &:hover, &:active, &:visited, &:focus': {
        color: secondary[500],
        textDecoration: 'none',
      }
    },
  },
  ironPiHeader: {
    ...ironPiLogo,
    margin: 0,
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

export type Props = {
  open: ?boolean,
  classes: Classes,
  onClose?: () => any,
}

const SidebarSections = withRouter(featureComponents({
  getComponents: feature => (feature: any).sidebarSections,
  sortFeatures: features => sortBy(features, feature => feature.sidebarSectionsOrder),
}))

class Sidebar extends React.Component<Props> {
  static defaultProps: {
    open: boolean,
  } = {
    open: false,
  }

  render(): ?React.Node {
    const {open, onClose, classes} = this.props
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
              <Icon><ChevronLeftIcon /></Icon>
            </IconButton>
          </h1>
          <h2 className={classes.ironPiHeader}>iron pi</h2>
        </div>
        <List className={classes.sidebarBody}>
          <SidebarSectionHeader component={NavLink} to={STATUS} title="Status" />
          <SidebarSections />
        </List>
      </div>
    )
  }
}

export default withStyles(styles, {withTheme: true})(Sidebar)

