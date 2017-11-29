/* @flow */

import * as React from 'react'
import {Provider} from 'react-redux'
import {StaticRouter} from 'react-router-dom'
import {renderToString} from 'react-dom/server'
import {SheetsRegistry, JssProvider} from 'react-jss'

import App from '../../universal/components/App'
import type {Store} from '../../universal/redux/types'
import '../../universal/components/initJss'

type Props = {
  title: string,
  assets?: Object,
  store: Store,
  location: string,
  routerContext: Object,
}

const environmentVars = []
const environmentScript = `
window.process = window.process || {}
process.env = process.env || {}
${environmentVars.map(name => `process.env[${JSON.stringify(name)}] = ${JSON.stringify(process.env[name] || '')}`).join('\n')}
`

const Html = ({routerContext, location, title, assets, store}: Props): React.Element<any> => {
  const {manifest, app, vendor} = assets || {}
  const initialState = `window.__INITIAL_STATE__ = ${JSON.stringify(store.getState().set('features', {}))}`
  const sheets = new SheetsRegistry()
  const root = renderToString(
    <JssProvider registry={sheets}>
      <Provider store={store}>
        <StaticRouter context={routerContext} location={location}>
          <App />
        </StaticRouter>
      </Provider>
    </JssProvider>
  )

  return (
    <html className="default">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>{title}</title>
        {vendor && vendor.css && <link rel="stylesheet" type="text/css" href={vendor.css} />}
        <style type="text/css" id="server-side-styles">
          {sheets.toString()}
        </style>
      </head>
      <body>
        <script dangerouslySetInnerHTML={{__html: environmentScript}} />
        <script dangerouslySetInnerHTML={{__html: initialState}} />
        <div id="root" dangerouslySetInnerHTML={{__html: root}} />
        {manifest && <script dangerouslySetInnerHTML={{__html: manifest.text}} />}
        {vendor && <script src={vendor.js} />}
        <script src={app ? app.js : '/assets/app.js'} />
      </body>
    </html>
  )
}

export default Html

