/* @flow */

import * as React from 'react'
import {Provider} from 'react-redux'
import {StaticRouter} from 'react-router-dom'
import {renderToString} from 'react-dom/server'

import jss from 'jss'
import configureJss from '../../universal/jss/configureJss'
configureJss(jss)

import {SheetsRegistry, JssProvider} from 'react-jss'
import type {ApolloClient} from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
import {MuiThemeProvider} from 'material-ui/styles'

import App from '../../universal/components/App'
import type {Store} from '../../universal/redux/types'
import theme from '../../universal/theme'

type Props = {
  title: string,
  assets?: Object,
  store: Store,
  apolloClient: ApolloClient,
  extractApolloState?: boolean,
  location: string,
  routerContext: Object,
  sheets: SheetsRegistry,
}

const environmentVars = []
const environmentScript = `
window.process = window.process || {}
process.env = process.env || {}
${environmentVars.map(name => `process.env[${JSON.stringify(name)}] = ${JSON.stringify(process.env[name] || '')}`).join('\n')}
`

const staticCss = `
body {
  font-family: Helvetica;
  font-weight: 400;
}
`

const Html = ({
  routerContext, location, title, assets, store, apolloClient, extractApolloState, sheets,
}: Props): React.Element<any> => {
  const {manifest, app, vendor} = assets || {}
  const initialState = `window.__INITIAL_STATE__ = ${JSON.stringify(store.getState().set('features', {}))}`
  const root = renderToString(
    <JssProvider registry={sheets} jss={jss}>
      <MuiThemeProvider theme={theme} sheetsManager={new Map()}>
        <ApolloProvider client={apolloClient}>
          <Provider store={store}>
            <StaticRouter context={routerContext} location={location}>
              <App />
            </StaticRouter>
          </Provider>
        </ApolloProvider>
      </MuiThemeProvider>
    </JssProvider>
  )

  const apolloState = extractApolloState
    ? `window.__APOLLO_STATE__=${JSON.stringify(apolloClient.extract()).replace(/</g, '\\u003c')}`
    : null

  return (
    <html className="default">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>{title}</title>
        <link href="https://fonts.googleapis.com/css?family=Rubik:300,400,500" rel="stylesheet" />
        {vendor && vendor.css && <link rel="stylesheet" type="text/css" href={vendor.css} />}
        <style type="text/css">{staticCss}</style>
        <style type="text/css" id="server-side-styles">
          {sheets.toString()}
        </style>
      </head>
      <body>
        <script dangerouslySetInnerHTML={{__html: environmentScript}} />
        <script dangerouslySetInnerHTML={{__html: initialState}} />
        {apolloState && <script dangerouslySetInnerHTML={{__html: apolloState}} />}
        <div id="root" dangerouslySetInnerHTML={{__html: root}} />
        {manifest && <script dangerouslySetInnerHTML={{__html: manifest.text}} />}
        {vendor && <script src={vendor.js} />}
        <script src={app ? app.js : '/assets/app.js'} />
      </body>
    </html>
  )
}

export default Html

