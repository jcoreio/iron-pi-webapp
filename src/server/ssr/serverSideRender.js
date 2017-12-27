// @flow

import * as React from 'react'
import fs from 'fs'
import path from 'path'
import type {$Request, $Response} from 'express'
import {renderToString} from 'react-dom/server'

import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { getDataFromTree } from 'react-apollo'
import { SchemaLink } from 'apollo-link-schema'
import schema from '../graphql/schema'

import makeStore from '../redux/makeStore'
import Html from './Html'
import type {Store} from '../../universal/redux/types'
import addFeatures from '../../universal/features/addFeatures'
import {StateRecord} from '../../universal/redux/types'

const rootDir = path.resolve(__dirname, '..', '..')

let assets
if (process.env.NODE_ENV === 'production') {
  assets = JSON.parse(fs.readFileSync(path.join(rootDir, 'assets.json'), 'utf8'))
  assets.manifest.text = fs.readFileSync(path.join(rootDir, assets.manifest.js), 'utf-8')
}

const serverSideRender = async (req: $Request, res: $Response): Promise<void> => {
  try {
    // first create a context for <ServerRouter>, it's where we keep the
    // results of rendering for the second pass if necessary
    const store: Store = makeStore(StateRecord())
    addFeatures(store)

    const headers: Object = {}
    const cookie = req.header('Cookie')
    if (cookie) headers.cookie = cookie

    const apolloClient = new ApolloClient({
      ssrMode: true,
      link: new SchemaLink({schema}),
      cache: new InMemoryCache(),
    })

    const routerContext: {status?: number, url?: string} = {}

    const app = (
      <Html
        title="Iron Pi"
        assets={assets}
        store={store}
        apolloClient={apolloClient}
        location={req.url}
        routerContext={routerContext}
      />
    )

    await getDataFromTree(app)

    const html = renderToString(React.cloneElement(app, {extractApolloState: true}))

    if (routerContext.url) {
      res.writeHead(routerContext.status || 302, {
        Location: routerContext.url,
      })
      res.end()
    } else {
      res.status(routerContext.status || 200)
      res.write('<!DOCTYPE html>\n')
      res.write(html)
      res.end()
    }
  } catch (error) {
    console.error(error.stack) // eslint-disable-line no-console
    res.status(500).send(`<pre>${error.stack}</pre>`)
  }
}

export default serverSideRender
