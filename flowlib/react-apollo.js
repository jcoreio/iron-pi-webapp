// @flow
/* eslint-disable */

import type {
  ApolloClient,
  MutationQueryReducersMap,
  ApolloQueryResult,
  ApolloError,
  FetchPolicy,
  FetchMoreOptions,
  UpdateQueryOptions,
  FetchMoreQueryOptions,
  SubscribeToMoreOptions,
  PureQueryOptions,
  MutationUpdaterFn,
} from 'apollo-client'
import type {Store} from 'redux'
import type {DocumentNode, VariableDefinitionNode} from 'graphql'

import * as React from 'react'

import {compose} from 'redux'
import gql from 'graphql-tag'

declare module 'react-apollo' {
  // export everything from apollo-client
  declare export * from 'apollo-client'
  declare export {gql, compose}

  declare export interface ProviderProps {
    store?: Store<*, *>,
    client: ApolloClient,
  }

  declare export class ApolloProvider extends React.Component<ProviderProps> {
    static childContextTypes: {
      store: Store<*, *>,
      client: ApolloClient,
    },
    static contextTypes: {
      store: Store<*, *>,
    },
    getChildContext(): {
      store: Store<*, *>,
      client: ApolloClient,
    },
    render(): React.Node,
  }

  declare export type MutationFunc<TResult> = (opts: MutationOpts,) => Promise<ApolloQueryResult<TResult>>

  declare export type ChildProps<P, R> = {
    data: QueryProps & R,
    mutate: MutationFunc<R>,
  } & P

  // back compat
  declare export type DefaultChildProps<P, R> = ChildProps<P, R>

  declare export interface MutationOpts {
    variables?: Object,
    optimisticResponse?: Object,
    updateQueries?: MutationQueryReducersMap<*>,
    refetchQueries?: string[] | PureQueryOptions[],
    update?: MutationUpdaterFn<*>,
  }

  declare export interface QueryOpts {
    ssr?: boolean,
    variables?: Object,
    fetchPolicy?: FetchPolicy,
    pollInterval?: number,
    skip?: boolean,
  }

  declare export interface QueryProps {
    error?: ApolloError,
    networkStatus: number,
    loading: boolean,
    variables: Object,
    fetchMore: (fetchMoreOptions: FetchMoreQueryOptions & FetchMoreOptions,) => Promise<ApolloQueryResult<any>>,
    refetch: (variables?: Object) => Promise<ApolloQueryResult<any>>,
    startPolling: (pollInterval: number) => void,
    stopPolling: () => void,
    subscribeToMore: (options: SubscribeToMoreOptions) => () => void,
    updateQuery: (mapFn: (previousQueryResult: any, options: UpdateQueryOptions) => any,) => void,
  }

  declare export interface OptionProps<TProps, TResult> {
    ownProps: TProps,
    data: QueryProps & TResult,
    mutate: MutationFunc<TResult>,
  }

  declare export type OptionDescription<P> = (props: P) => QueryOpts | MutationOpts

  declare export type NamedProps<P, R> = P & {
    ownProps: R,
  }

  declare export interface OperationOption<TProps: {}, TResult: {}> {
    options?: OptionDescription<TProps>,
    props?: (props: OptionProps<TProps, TResult>) => any,
    +skip?: boolean | ((props: any) => boolean),
    name?: string,
    withRef?: boolean,
    shouldResubscribe?: (props: TProps, nextProps: TProps) => boolean,
    alias?: string,
  }

  declare export interface OperationComponent<
  TResult: Object = {},
  TOwnProps: Object = {},
  TMergedProps = ChildProps<TOwnProps, TResult>,
  > {
    (component: | React.StatelessFunctionalComponent<TMergedProps>
      | Class<React.Component<any, TMergedProps, any>>,): Class<React.Component<void, TOwnProps, void>>,
  }

  declare export function graphql<TResult, TProps, TChildProps>(document: DocumentNode,
                                                                operationOptions?: OperationOption<TProps, TResult>,): OperationComponent<TResult, TProps, TChildProps>

  declare export function withApollo<TProps>(component: | React.StatelessFunctionalComponent<TProps & ApolloClient>
    | Class<React.Component<any, TProps & ApolloClient, any>>,): Class<React.Component<void, TProps & ApolloClient, void>>

  declare export interface IDocumentDefinition {
    type: DocumentType,
    name: string,
    variables: VariableDefinitionNode[],
  }

  declare export function parser(document: DocumentNode): IDocumentDefinition

  declare export interface Context {
    client?: ApolloClient,
    store?: Store<*, *>,

    [key: string]: any,
  }

  declare export interface QueryTreeArgument {
    rootElement: React.Element<*>,
    rootContext?: Context,
  }

  declare export interface QueryResult {
    query: Promise<ApolloQueryResult<mixed>>,
    element: React.Element<*>,
    context: Context,
  }

  declare export function walkTree(element: React.Element<*>,
                                   context: Context,
                                   visitor: (element: React.Element<*>,
                                             instance: any,
                                             context: Context,) => boolean | void,): void

  declare export function getDataFromTree(rootElement: React.Element<*>,
                                          rootContext?: any,
                                          fetchRoot?: boolean,): Promise<void>

  declare export function renderToStringWithData(component: React.Element<*>,): Promise<string>

  declare export function cleanupApolloState(apolloState: any): void
}

