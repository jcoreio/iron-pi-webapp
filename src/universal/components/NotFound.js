// @flow

import * as React from 'react'

import type {Location} from 'react-router'

import Status from '../react-router/Status'

const NotFound = ({location: {pathname}}: {location: Location}): React.Element<any> => (
  <Status code={404}><pre>Not found: {pathname}</pre></Status>
)

export default NotFound
