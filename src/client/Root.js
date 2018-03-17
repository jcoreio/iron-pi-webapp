/* @flow */

import * as React from 'react'
import {BrowserRouter as Router} from 'react-router-dom'
import {Provider} from 'react-redux'
import {JssProvider} from 'react-jss'
import App from '../universal/components/App'
import type {Store} from '../universal/redux/types'
import createJss from '../universal/jss/createJss'

const jss = createJss()

type Props = {
  store: Store,
}

export default class Root extends React.Component<Props, void> {
  render(): React.Node {
    const {store} = this.props
    return (
      <JssProvider jss={jss}>
        <Provider store={store}>
          <Router>
            <App />
          </Router>
        </Provider>
      </JssProvider>
    )
  }
}
