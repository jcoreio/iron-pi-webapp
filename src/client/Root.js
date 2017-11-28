/* @flow */

import * as React from 'react'
import {Router, browserHistory} from 'react-router'
import {Provider} from 'react-redux'
import routes from '../universal/routes/index'
import {syncHistoryWithStore} from 'react-router-redux'
import type {Store, State} from '../universal/redux/types'
import applyMiddleware from '@jcoreio/react-router-apply-middleware'
import routePropsContext from 'react-router-route-props-context'

type Props = {
  store: Store,
}

export default class Root extends React.Component<Props, void> {
  render(): React.Node {
    const {store} = this.props
    const history = syncHistoryWithStore(browserHistory, store, {
      selectLocationState: (state: State): Object => state.router
    })
    return (
      <Provider store={store}>
        <Router history={history} routes={routes(store)} render={applyMiddleware(routePropsContext())} />
      </Provider>
    )
  }
}
