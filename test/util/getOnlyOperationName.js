// @flow

import type {DocumentNode} from 'graphql'

export default function getOnlyOperationName(doc: DocumentNode): ?string {
  for (let definition of doc.definitions) {
    if (definition.kind === 'OperationDefinition' && definition.name) {
      return definition.name.value
    }
  }
}
