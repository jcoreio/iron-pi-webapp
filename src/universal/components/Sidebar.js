// @flow

import * as React from 'react'
import {Link} from 'react-router-dom'
import {withStyles} from 'material-ui/styles'
import Drawer from 'material-ui/Drawer'
import IconButton from 'material-ui/IconButton'
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft'

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
  drawerHeader: {
    borderBottomWidth: 3,
    borderBottomStyle: 'solid',
    borderBottomColor: theme.jcorePrimaryColor,
    padding: `${vPadding}px ${hPadding}px`,
    fontFamily: 'Rubik',
    fontWeight: 300,
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

export type Props = {
  open: boolean,
  classes: Object,
  onClose?: () => any,
}

class Sidebar extends React.Component<Props> {
  static defaultProps: {
    open: boolean,
  } = {
    open: false,
  }
  render(): ?React.Node {
    const {open, onClose, classes} = this.props
    return (
      <Drawer id="sidebar" open={open} type="persistent" anchor="left" classes={{paper: classes.drawerPaper}}>
        <div className={classes.drawerHeader}>
          <h1 className={classes.jcoreHeader}>
            <Link to="/">jcore.io</Link>
            <IconButton id="closeSidebarButton" color="inherit" onClick={onClose} className={classes.closeButton}>
              <ChevronLeftIcon />
            </IconButton>
          </h1>
          <h2 className={classes.ironPiHeader}>IRON PI</h2>
        </div>
      </Drawer>
    )
  }
}

export default withStyles(styles, {withTheme: true})(Sidebar)
