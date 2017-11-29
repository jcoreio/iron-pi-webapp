// @flow

import * as React from 'react'

import type {RouteComponentProps} from 'react-router'

const NotFound = ({location: {pathname}}: RouteComponentProps): React.Element<any> => (
  <div>nothing matched {pathname}</div>
)

export default NotFound
