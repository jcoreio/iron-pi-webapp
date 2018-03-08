// @flow

import * as React from 'react'
import classNames from 'classnames'
import {Route, Link, withRouter} from 'react-router-dom'
import type {Location, RouterHistory} from 'react-router-dom'
import Switch from 'react-router-transition-switch'
import Fader from './Fader'
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'
import {withStyles} from 'material-ui/styles'
import {compose} from 'redux'

import NotFound from './NotFound'
import NavbarContainer from './Navbar/NavbarContainer'
import SidebarContainer from './Sidebar/SidebarContainer'
import type {Dispatch, RenderMode, State} from '../redux/types'
import type {Theme} from '../theme'
import LoginDialogContainer from './Login/LoginDialogContainer'
import ChangePasswordDialog from './ChangePassword/ChangePasswordDialog'
import ChangePasswordFormContainer from './ChangePassword/ChangePasswordFormContainer'
import featureContent from './featureContent'
import {CHANGE_PASSWORD, MAPPING_PROBLEMS} from '../react-router/paths'
import MappingProblemsViewContainer from './MappingProblemsViewContainer'
import MappingProblemsSnackbarContainer from './MappingProblemsSnackbarContainer'

const Home = () => <h1>Home</h1>
const About = () => (
  <div>
    <h1>About</h1>
    <Link to="/">Home</Link>
  </div>
)

const styles = ({spacing, sidebar, palette: {background}}: Theme) => ({
  frame: {
    position: 'fixed',
    display: 'flex',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    position: 'absolute',
    backgroundColor: background.contentFrame,
    top: 0,
    left: 0,
    bottom: 0,
    transition: {
      ...sidebar.transition,
      property: 'left',
    },
    [`@media (max-width: ${sidebar.autoOpenBreakpoint() - 1}px)`]: {
      width: '100%',
    },
    [`@media (min-width: ${sidebar.autoOpenBreakpoint()}px)`]: {
      right: 0,
    },
  },
  contentOpen: {
    left: sidebar.width,
  },
  contentAuto: {
    [`@media (max-width: ${sidebar.autoOpenBreakpoint() - 1}px)`]: {
      left: 0,
    },
    [`@media (min-width: ${sidebar.autoOpenBreakpoint()}px)`]: {
      left: sidebar.width,
    },
  },
  body: {
    padding: `0 ${spacing.unit * 3}px`,
    overflowY: 'auto',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 56,
    "@media (min-width:0px) and (orientation: landscape)": {
      top: 48
    },
    "@media (min-width:600px)": {
      top: 64
    }
  },
})

type ExtractClasses = <T: Object>(styles: (theme: Theme) => T) => {[name: $Keys<T>]: string}
type Classes = $Call<ExtractClasses, typeof styles>

type PropsFromJss = {
  classes: Classes,
}

type PropsFromRouter = {
  location: Location,
  history: RouterHistory,
}

type PropsFromState = {
  sidebarOpen: ?boolean,
  renderMode: RenderMode,
}

type PropsFromDispatch = {
  dispatch: Dispatch,
}

type Props = PropsFromJss & PropsFromState & PropsFromDispatch & PropsFromRouter

const BodyRoutes = featureContent({getContent: feature => (feature: any).bodyRoutes})

class App extends React.Component<Props> {
  render(): ?React.Node {
    const {classes, sidebarOpen, renderMode, location, history} = this.props
    return (
      <div className={classes.frame}>
        <SidebarContainer />
        <MappingProblemsSnackbarContainer />
        <div
          className={classNames(classes.content, {
            [classes.contentOpen]: sidebarOpen,
            [classes.contentAuto]: sidebarOpen == null,
          })}
        >
          <NavbarContainer />
          <ChangePasswordDialog open={location.pathname === CHANGE_PASSWORD}>
            <ChangePasswordFormContainer history={history} />
          </ChangePasswordDialog>
          {renderMode === 'client' && <LoginDialogContainer />}
          <div className={classes.body} id="body">
            <BodyRoutes>
              {routes => (
                <Switch component={Fader} createKey={(child, match) => match.url}>
                  <Route path="/" exact component={Home} />
                  <Route path="/about" exact component={About} />
                  <Route path={CHANGE_PASSWORD} exact render={() => <div />} />
                  <Route path={MAPPING_PROBLEMS} exact component={MappingProblemsViewContainer} />
                  {routes}
                  <Route path="*" component={NotFound} />
                </Switch>
              )}
            </BodyRoutes>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps: (state: State) => PropsFromState = createStructuredSelector({
  sidebarOpen: (state: State) => state.sidebar.open,
  renderMode: (state: State) => state.renderMode,
})

export default compose(
  withRouter,
  withStyles(styles, {withTheme: true}),
  connect(mapStateToProps)
)(App)


