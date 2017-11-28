// @flow

import {createMiddleware} from 'mindfront-redux-utils'
import type {Middleware, MiddlewareAPI, Dispatch, Action} from '../../universal/redux/types'
import type SymmetryClient from './SymmetryClient'
import timeout from '../../universal/util/timeout'

import {RECONNECT, reconnect, setConnecting, setOpen, setClosed} from '../../universal/redux/symmetry'
import {loginWithToken} from '../../universal/auth/redux'

export const RECONNECT_TIMEOUT = 16000
const backoffDelay = [1000, 5000, 10000, 30000, 60000]

export default function symmetryConnectionMiddleware(symmetry: SymmetryClient): Middleware {
  return createMiddleware({
    [RECONNECT]: ({dispatch, getState}: MiddlewareAPI) => (next: Dispatch) => async (action: Action): Promise<void> => {
      let {status, retryTimeoutId} = getState().connection
      if (status === 'CONNECTING') return

      if (retryTimeoutId != null) clearTimeout(retryTimeoutId)

      dispatch(setConnecting())
      let {retryCount} = getState().connection

      try {
        await timeout(symmetry.reconnect(), RECONNECT_TIMEOUT)
      } catch (error) {
        // schedule another retry
        const retryDelay = backoffDelay[Math.min(retryCount - 1, backoffDelay.length - 1)]
        const nextRetryTime = Date.now() + retryDelay
        retryTimeoutId = setTimeout(() => dispatch(reconnect()), retryDelay)
        dispatch(setClosed({nextRetryTime, retryTimeoutId}))

        throw error
      }
      dispatch(setOpen())

      const authToken = localStorage.getItem('authToken')
      if (authToken) {
        try {
          await dispatch(loginWithToken(authToken))
        } catch (error) {
          // ignore
        }
      }
      symmetry.resumeSubscriptions()
    },
  })
}

