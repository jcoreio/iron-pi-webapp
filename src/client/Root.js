/* @flow */

import * as React from 'react'
import {BrowserRouter as Router} from 'react-router-dom'
import {Provider} from 'react-redux'
import {ApolloProvider} from 'react-apollo'
import App from '../universal/components/App'
import type {Store} from '../universal/redux/types'
import apolloClient from './apollo/client'
import {JssProvider} from 'react-jss'
import jss from 'jss'
import {MuiThemeProvider} from 'material-ui/styles'
import theme from '../universal/material-ui/theme'

type Props = {
  store: Store,
}

export default class Root extends React.Component<Props, void> {
  render(): React.Node {
    const {store} = this.props
    return (
      <JssProvider jss={jss}>
        <MuiThemeProvider theme={theme}>
          <ApolloProvider client={apolloClient}>
            <Provider store={store}>
              <Router>
                <App />
              </Router>
            </Provider>
          </ApolloProvider>
        </MuiThemeProvider>
      </JssProvider>
    )
  }
}

