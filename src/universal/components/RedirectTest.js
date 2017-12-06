// @flow

import * as React from 'react'
import RedirectWithStatus from '../react-router/RedirectWithStatus'

const RedirectTest = ({match: {params: {code}}}: {match: {params: {code: number}}}) => (
  <RedirectWithStatus
    code={code}
    to="/"
  />
)

export default RedirectTest

