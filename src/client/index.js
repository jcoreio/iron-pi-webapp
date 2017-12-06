// @flow

// $FlowFixMe
import { render, hydrate } from 'react-dom'
import * as React from 'react'
import { AppContainer } from 'react-hot-loader'
import makeStore from './redux/makeStore'
import {parseState} from '../universal/redux/types'
import Root from './Root'
import {setRenderMode} from '../universal/redux/renderMode'
import addFeatures from '../universal/features/addFeatures'
import {loadInitialFeatures} from 'redux-features'
import '../universal/components/initJss'

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

  if (process.env.NODE_ENV !== 'production') {
    window.store = store
  }

  let reloads = 0

  function mount(Root: typeof Root, callback?: () => void) {
    hydrate(
      <AppContainer key={++reloads}>
        <Root store={store} />
      </AppContainer>,
      rootElement,
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
    }
  )
}
bootstrap()

