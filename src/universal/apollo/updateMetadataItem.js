// @flow

import type {ApolloClient} from 'apollo-client'
import gql from 'graphql-tag'
import type {MetadataItem} from '../types/MetadataItem'

const query = gql(`query updateMetadataItem($tag: String!) {
  MetadataItem(tag: $tag) {
    tag
  }
}`)

export default function updateMetadataItem(proxy: ApolloClient, metadataItem: MetadataItem) {
  const {tag} = metadataItem
  proxy.writeQuery({
    query,
    data: {MetadataItem: metadataItem},
    variables: {tag},
  })
}

