// @flow

import './bypassWarnIfNotMemoizedInProd'
import { render } from 'react-dom'
import * as React from 'react';
import { AppContainer } from 'react-hot-loader'
import makeStore from './redux/makeStore'
import {parseState} from '../universal/redux/types'
import Root from './Root'
import {setRenderMode} from '../universal/redux/renderMode'
import {loginWithToken} from '../universal/auth/redux'
import Symmetry from './symmetry'
import addFeatures from '../universal/features/addFeatures'
import {loadInitialFeatures} from 'redux-features'
import {Alert} from '@jcoreio/rubix'
import {reconnect, setOpen} from '../universal/redux/symmetry'
import '../universal/components/initJss'

async function bootstrap(): Promise<any> {
  function renderError(error: any) {
    render(
      <Alert danger>
        {error}
      </Alert>,
      document.getElementById('root')
    )
  }

  const symmetry = Symmetry.client()

  if (process.env.NODE_ENV !== 'production') {
    window.Symmetry = symmetry
    try {
      window.Perf = require('react-addons-perf')
    } catch (e) {
      /* eslint-disable no-console */
      console.warn("react-addons-perf not found")
      /* eslint-enable no-console */
    }
  }

  // the state is serialized to plain JS for sending over the wire, so we have
  // to convert it back to immutables here
  const store = makeStore(parseState(window.__INITIAL_STATE__), {symmetry})
  addFeatures(store)

  // update symmetry connection state in redux once the initial connection succeeds
  symmetry.once('open', () => store.dispatch(setOpen()))
  // automatically reconnect when the symmetry connection fails
  symmetry.on('close', onConnectionFailed)
  symmetry.on('heartbeatTimeout', onConnectionFailed)
  function onConnectionFailed() {
    const {status} = store.getState().connection
    if (status === 'OPEN') store.dispatch(reconnect())
  }

  let reloads = 0

  function mount(Root: typeof Root, callback?: () => void) {
    render(
      <AppContainer key={++reloads}>
        <Root store={store} symmetry={symmetry} />
      </AppContainer>,
      document.getElementById('root'),
      // $FlowFixMe
      callback,
    )
  }


  // Hot Module Replacement API
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

  mount(
    Root,
    () => {
      // We don't need the static css any more once we have launched our application.
      const ssStyles = document.getElementById('server-side-styles')
      if (ssStyles && ssStyles.parentNode) ssStyles.parentNode.removeChild(ssStyles)
      // render anything that we couldn't on the server
      store.dispatch(setRenderMode('client'))
      // automatically log back in if the user has an auth in local storage
      const authToken = localStorage.getItem('authToken')
      if (authToken) store.dispatch(loginWithToken(authToken))
    }
  )
}
bootstrap()

