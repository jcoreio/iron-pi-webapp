// @flow

import { GraphQLScalarType } from 'graphql'
import type { ASTNode, ObjectFieldNode } from 'graphql'
import { Kind } from 'graphql/language'

function parseLiteral(ast: ASTNode): mixed {
  switch (ast.kind) {
  case Kind.STRING:
  case Kind.BOOLEAN:
    return ast.value
  case Kind.INT:
  case Kind.FLOAT:
    return parseFloat(ast.value)
  case Kind.OBJECT: {
    const value = Object.create(null)
    ast.fields.forEach((field: ObjectFieldNode) => {
      value[field.name.value] = parseLiteral(field.value)
    })

    return value
  }
  case Kind.LIST:
    return ast.values.map(parseLiteral)
  default:
    return null
  }
}

type Options = {
  name: string,
  description?: string,
  validate: (value: mixed) => mixed,
}

export default class FlowRuntimeJsonType extends GraphQLScalarType {
  constructor({validate, ...options}: Options) {
    super({
      ...options,
      serialize: validate,
      parseValue: validate,
      parseLiteral,
    })
  }
}

