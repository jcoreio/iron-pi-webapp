// @flow

import type {DocumentNode, OperationDefinitionNode} from 'graphql'

export default function getOperationByName(doc: DocumentNode, name: string): ?OperationDefinitionNode {
  for (let definition of doc.definitions) {
    if (definition.kind === 'OperationDefinition' && definition.name && definition.name.value === name) {
      return definition
    }
  }
}
