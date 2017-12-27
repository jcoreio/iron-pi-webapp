// @flow

import * as React from 'react'
import {Route, Link, Switch} from 'react-router-dom'
import NotFound from './NotFound'
import Hello from './Hello'
import Sidebar from './Sidebar'
import {withStyles} from 'material-ui/styles'

const Home = () => <h1>Home</h1>
const About = () => (
  <div>
    <h1>About</h1>
    <Link to="/">Home</Link>
  </div>
)

const styles = {
  appFrame: {
    position: 'fixed',
    display: 'flex',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
}

type Classes = {[name: $Keys<typeof styles>]: string}

type Props = {
  classes: Classes,
}

const App = ({classes}: Props): React.Element<any> => {
  return (
    <div className={classes.appFrame}>
      <Sidebar open={true} />
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/hello" exact component={Hello} />
        <Route path="/about" exact component={About} />
        <Route path="*" component={NotFound} />
      </Switch>
    </div>
  )
}

export default withStyles(styles)(App)

