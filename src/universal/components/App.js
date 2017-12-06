// @flow

import * as React from 'react'
import {Route, Link, Switch} from 'react-router-dom'
import ErrorTest from './ErrorTest'
import RedirectTest from './RedirectTest'
import NotFound from './NotFound'

const Home = () => <h1>Home</h1>
const About = () => (
  <div>
    <h1>About</h1>
    <Link to="/">Home</Link>
  </div>
)

const TEST = process.env.BABEL_ENV === 'test'

const App = (): React.Element<any> => {
  return (
    <Switch>
      <Route path="/" exact component={Home} />
      {TEST && <Route path="/about" component={About} />}
      {TEST && <Route path="/errorTest" exact component={ErrorTest} />}
      {TEST && <Route path="/redirectTest/:code" exact component={RedirectTest} />}
      <Route path="*" component={NotFound} />
    </Switch>
  )
}

export default App

