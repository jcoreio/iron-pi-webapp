// @flow

import * as React from 'react';
import makeStore from '../redux/makeStore'
import {match as _match} from 'react-router'
import Html from './Html'
import {push} from 'react-router-redux'
import {renderToString} from 'react-dom/server'
import fs from 'fs'
import path from 'path'
import type {$Request, $Response} from 'express'
import type {Store} from '../../universal/redux/types'
import NotFound from '../../universal/components/NotFound'
import addFeatures from '../../universal/features/addFeatures'
import {State} from '../../universal/redux/types'
import applyMiddleware from '@jcoreio/react-router-apply-middleware'
import routePropsContext from 'react-router-route-props-context'
import type {MatchOptions, Location} from 'react-router'

const rootDir = path.resolve(__dirname, '..', '..')

type MatchResult = {
  redirectLocation: ?Location,
  renderProps: ?Object,
}

function match({routes, location}: MatchOptions): Promise<MatchResult> {
  return new Promise((resolve: (result: MatchResult) => void, reject: (error: Error) => void) => {
    _match({routes, location}, (error: ?Error, redirectLocation: ?Location, renderProps?: Object) => {
      if (error) {
        reject(error)
        return
      }
      if (redirectLocation || renderProps) resolve({redirectLocation, renderProps})
    })
  })
}

let assets
if (process.env.NODE_ENV === 'production') {
  assets = JSON.parse(fs.readFileSync(path.join(rootDir, 'assets.json'), 'utf8'))
  assets.manifest.text = fs.readFileSync(path.join(rootDir, assets.manifest.js), 'utf-8')
}

const serverSideRender = async (req: $Request, res: $Response): Promise<void> => {
  try {
    const symmetry = {
      subscribe(): any {
        // this is a stub for now.  Later we can use this to fetch data before responding.
      },
      async call(): Promise<void> {
        // this is a stub for now.  Later we can use this to fetch data before responding.
      },
    }

    // first create a context for <ServerRouter>, it's where we keep the
    // results of rendering for the second pass if necessary
    const store: Store = makeStore(new State(), {symmetry})
    addFeatures(store)

    const makeRoutes = require('../../universal/routes/index').default
    const routes = makeRoutes(store)
    const {redirectLocation, renderProps} = await match({
      routes,
      location: req.url,
      render: applyMiddleware(routePropsContext()),
    })

    if (redirectLocation) {
      res.redirect(redirectLocation.pathname + redirectLocation.search)
    } else if (renderProps) {
      const location = renderProps && renderProps.location && renderProps.location.pathname || '/'
      store.dispatch(push(location))

      const html = renderToString(
        <Html
            title="Pason Power"
            assets={assets}
            store={store}
            renderProps={renderProps}
        />
      )

      const {routes} = renderProps
      if (routes && routes.length && routes[routes.length - 1].component === NotFound) res.status(404)
      else res.status(200)

      res.write('<!DOCTYPE html>')
      res.write(html)

      res.end()
    } else {
      res.status(404).send('Not found')
    }
  } catch (error) {
    console.error(error.stack) // eslint-disable-line no-console
    ;(res: Object).status(500).send(`<pre>${error.stack}</pre>`)
  }
}

export default serverSideRender
