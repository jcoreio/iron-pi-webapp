/* @flow */

import * as React from 'react'
import {BrowserRouter as Router} from 'react-router-dom'
import {Provider} from 'react-redux'
import App from '../universal/components/App'
import type {Store} from '../universal/redux/types'

type Props = {
  store: Store,
}

export default class Root extends React.Component<Props, void> {
  render(): React.Node {
    const {store} = this.props
    return (
      <Provider store={store}>
        <Router>
          <App />
        </Router>
      </Provider>
    )
  }
}
