// @flow

import * as React from 'react'
import {Route, Redirect} from 'react-router-dom'
import type {LocationShape} from 'react-router-dom'

type Props = {
  from?: string | LocationShape,
  to: string | LocationShape,
  code?: number,
}

const RedirectWithStatus = ({ from, to, code }: Props) => (
  <Route
    render={({ staticContext }: Object) => {
      // there is no `staticContext` on the client, so
      // we need to guard against that here
      if (staticContext) staticContext.status = code || 302
      return <Redirect from={from} to={to} />
    }}
  />
)

export default RedirectWithStatus

