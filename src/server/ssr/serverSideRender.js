// @flow

import * as React from 'react'
import fs from 'fs'
import path from 'path'
import type {$Request, $Response} from 'express'
import {renderToString} from 'react-dom/server'

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

    const routerContext: {status?: number, url?: string} = {}

    const html = renderToString(
      <Html
        title="<<APP_TITLE>>"
        assets={assets}
        store={store}
        location={req.url}
        routerContext={routerContext}
      />
    )

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
