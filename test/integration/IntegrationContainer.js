// @flow

import * as React from 'react'
import jss from 'jss'
import {SheetsRegistry} from 'jss'
import {JssProvider} from 'react-jss'
import {MuiThemeProvider} from 'material-ui/styles'
import {ApolloProvider} from 'react-apollo'
import {Provider} from 'react-redux'
import {MemoryRouter} from 'react-router'
import type {ApolloClient} from "apollo-client"

import theme from '../../src/universal/theme'
import makeStore from '../../src/server/redux/makeStore'
import type {Store} from '../../src/universal/redux/types'
import {StateRecord} from '../../src/universal/redux/types'
import type {Theme} from '../../src/universal/theme'

export type Props = {
  router: React.ElementProps<typeof MemoryRouter>,
  client: ApolloClient,
  theme: Theme,
  store?: Store,
  sheets?: SheetsRegistry,
  children?: React.Node,
}

export default class IntegrationContainer extends React.Component<Props> {
  static defaultProps: {
    router: React.ElementProps<typeof MemoryRouter>,
    theme: Theme,
  } = {
    router: {
      initialEntries: ['/'],
      initialIndex: 0,
    },
    theme,
  }
  defaultStore = makeStore(StateRecord())
  defaultSheets = new SheetsRegistry()

  render(): ?React.Node {
    const {router, children, theme, client} = this.props
    const store = this.props.store || this.defaultStore
    const sheets = this.props.sheets || this.defaultSheets
    return (
      <JssProvider registry={sheets} jss={jss}>
        <MuiThemeProvider theme={theme} sheetsManager={new Map()}>
          <ApolloProvider client={client}>
            <Provider store={store}>
              <MemoryRouter {...router}>
                {children}
              </MemoryRouter>
            </Provider>
          </ApolloProvider>
        </MuiThemeProvider>
      </JssProvider>
    )
  }
}

