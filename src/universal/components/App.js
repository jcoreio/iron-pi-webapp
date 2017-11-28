// @flow

import * as React from 'react';
import {MainContainer} from '@jcoreio/rubix'
import type {RouteComponentProps} from 'react-router'
import createSubscriber from './createSubscriber'
import {createSelector} from 'reselect'
import {updateUser} from '../auth/redux'

import Sidebar from './Sidebar'
import Navbar from './Navbar'

type Props = RouteComponentProps & {
  children?: any
}

// Always subscribe for changes to the logged-in user
const UserSub = createSubscriber({
  args: createSelector(
    state => state.user && state.user.id,
    userId => userId
      ? ['users.subscribeOneWithPolicies', {where: {id: userId}}]
      : null
  ),
  // since this sub is updating the user, if it resubscribed on user permissions changes it
  // would cause an infinite loop
  ignorePermissionsChanges: true,
  actions: {
    data: updateUser,
    // These aren't real action types that reducers handle, they were just for debugging
    // error: error => ({type: 'USER_SUB_ERROR', payload: error}),
    // stop: error => ({type: 'USER_SUB_ERROR', payload: error}),
    // ready: () => ({type: 'USER_SUB_READY'}),
  }
})

/**
 * The app shell that renders the sidebar, navbar, and content for the active route.
 */
const App = ({children, ...routeProps}: Props): React.Element<any> => (
  <MainContainer {...routeProps}>
    <Sidebar />
    <Navbar />
    <div id="body">
      {children}
    </div>
    <UserSub />
  </MainContainer>
)

export default App

