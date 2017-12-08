// @flow

import * as React from 'react'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'

const Hello = graphql(gql(`{
  hello
}`))(({data}) => <pre>{JSON.stringify(data, null, 2)}</pre>)

export default Hello

