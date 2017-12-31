// @flow

// $FlowFixMe
import { render, hydrate } from 'react-dom'
import * as React from 'react'
import { AppContainer } from 'react-hot-loader'
import promisify from 'es6-promisify'
import {loadInitialFeatures} from 'redux-features'

import jss from 'jss'
import configureJss from '../universal/jss/configureJss'
configureJss(jss)

import makeStore from './redux/makeStore'
import {parseState} from '../universal/redux/types'
import Root from './Root'
import {setRenderMode} from '../universal/redux/renderMode'
import addFeatures from '../universal/features/addFeatures'
import apollo, {cache} from './apollo/client'
import theme from '../universal/theme'

async function bootstrap(): Promise<any> {
  const rootElement = document.getElementById('root')
  if (!rootElement) throw new Error("Can't find #root element")

  function renderError(error: any) {
    render(
      <div>
        {error}
      </div>,
      rootElement
    )
  }

  // the state is serialized to plain JS for sending over the wire, so we have
  // to convert it back hydrate immutables here
  const store = makeStore(parseState(window.__INITIAL_STATE__))
  addFeatures(store)

  // istanbul ignore next
  if (process.env.NODE_ENV !== 'production') {
    window.store = store
    window.dispatch = store.dispatch
    window.apollo = apollo
    window.cache = cache
    window.gql = require('graphql-tag').default
    window.theme = theme
    window.jss = jss
  }

  let reloads = 0

  const mount = promisify((Root: typeof Root, callback?: () => void) => {
    hydrate(
      <AppContainer key={++reloads}>
        <Root store={store} />
      </AppContainer>,
      rootElement,
      // $FlowFixMe
      callback,
    )
  })

  // Hot Module Replacement API
  // istanbul ignore next
  if (module.hot instanceof Object) {
    module.hot.accept('./Root', () => {
      mount(require('./Root').default)
    })
  }

  try {
    await store.dispatch(loadInitialFeatures())
  } catch (error) {
    renderError(`Failed to load some features: ${error.stack}`)
  }

  await mount(Root)

  // We don't need the static css any more once we have launched our application.
  const ssStyles = document.getElementById('server-side-styles')
  if (ssStyles && ssStyles.parentNode) ssStyles.parentNode.removeChild(ssStyles)
  // render anything that we couldn't on the server
  store.dispatch(setRenderMode('client'))
}

bootstrap().catch(console.error) // eslint-disable-line no-console

