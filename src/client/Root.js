/* @flow */

import * as React from 'react'
import {BrowserRouter as Router} from 'react-router-dom'
import {Provider} from 'react-redux'
import {ApolloProvider} from 'react-apollo'
import App from '../universal/components/App'
import type {Store} from '../universal/redux/types'
import {JssProvider} from 'react-jss'
import {MuiThemeProvider} from '@material-ui/core/styles'
import theme from '../universal/theme'
import createJss from '../universal/jss/createJss'

const jss = createJss()

type Props = {
  store: Store,
  client: ApolloClient,
}

export default class Root extends React.Component<Props, void> {
  render(): React.Node {
    const {store, client} = this.props
    return (
      <JssProvider jss={jss}>
        <MuiThemeProvider theme={theme}>
          <ApolloProvider client={client}>
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

