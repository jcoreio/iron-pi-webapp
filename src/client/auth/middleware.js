// @flow

import type { ApolloClient } from 'apollo-client'
import {createMiddleware} from 'mindfront-redux-utils'
import superagent from 'superagent'
import {stopSubmit} from 'redux-form'

import type {Dispatch, Middleware, MiddlewareAPI} from '../../universal/redux/types'
import {LOGIN, LOGOUT} from '../../universal/auth/actions'
import type {LoginAction, LogoutAction} from '../../universal/auth/actions'

type Options = {
  client: ApolloClient,
}

export function authMiddleware({client}: Options): Middleware {
  return createMiddleware({
    [LOGIN]: (store: MiddlewareAPI) => (next: Dispatch) => async (action: LoginAction) => {
      const {password} = action.payload
      const {body: {token, error}} = await superagent.post('/login')
        .type('json')
        .accept('json')
        .send({username: 'root', password})
        .catch(({response}) => response)

      if (error) {
        throw new Error(error)
      } else if (token) {
        localStorage.setItem('token', token)
        client.resetStore()
      }
    },
    [LOGOUT]: (store: MiddlewareAPI) => (next: Dispatch) => async (action: LogoutAction) => {
      if (!localStorage.getItem('token')) return
      const {error} = action.payload || {}
      localStorage.removeItem('token')
      await client.resetStore()
      if (error) {
        store.dispatch(stopSubmit('login', {_error: error}))
      }
    },
  })
}

