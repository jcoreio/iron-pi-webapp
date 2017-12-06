// @flow

import * as React from 'react'
import {Route, Link, Switch} from 'react-router-dom'
import NotFound from './NotFound'

const Home = () => <h1>Home</h1>
const About = () => (
  <div>
    <h1>About</h1>
    <Link to="/">Home</Link>
  </div>
)

const App = (): React.Element<any> => {
  return (
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/about" exact component={About} />
      <Route path="*" component={NotFound} />
    </Switch>
  )
}

export default App

