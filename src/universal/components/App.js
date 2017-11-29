// @flow

import * as React from 'react'
import {Route, Switch} from 'react-router-dom'
import RedirectWithStatus from '../react-router/RedirectWithStatus'

const Home = () => <h1>Home</h1>
const About = () => <h1>About</h1>

const App = (): React.Element<any> => (
  <Switch>
    <Route path="/" exact component={Home} />
    <Route path="/about" component={About} />
    <RedirectWithStatus from="*" to="/" />
  </Switch>
)

export default App

