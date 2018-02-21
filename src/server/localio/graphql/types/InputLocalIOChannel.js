// @flow

import * as graphql from 'graphql'
import LocalIOChannel from '../../models/LocalIOChannel'
import defaultInputType from '../../../graphql/types/defaultInputType'
import InputMetadataItem from '../../../graphql/types/InputMetadataItem'

export default function createInputLocalIOChannel({attributeFieldsCache}: {
  attributeFieldsCache?: Object,
}): graphql.GraphQLInputObjectType {
  return defaultInputType(LocalIOChannel, {
    cache: attributeFieldsCache,
    fields: {
      metadataItem: {
        type: InputMetadataItem,
      }
    },
  })
}

