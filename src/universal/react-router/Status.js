// @flow

import * as React from 'react'
import {Route} from 'react-router-dom'

export type Props = {
  code: number,
  children?: React.Node,
}

const Status = ({code, children}: Props): React.Element<typeof Route> => (
  <Route
    render={({ staticContext }: Object) => {
      if (staticContext) staticContext.status = code
      return children
    }}
  />
)

export default Status
