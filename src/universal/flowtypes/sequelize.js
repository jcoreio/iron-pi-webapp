// @flow

// I adapted everything in here somewhat hastily from the sequelize
// documentation.  If you're doing advanced sequelize queries that seem
// to work but cause Flow errors, there's probably a mistake in these
// types.

// I don't know exactly what form some of these take, they could be refined
// in the future
export type Transaction = any
export type Where = Object
export type Association = any
export type Lock = string | Object
export type Having = Object
export type On = Object
export type Group = Object
export type Model = any // instance of sequelize.model, but I think it can also be a string sometimes?

export type Attribute = string | [string | Function, string]

export type Attributes = Array<string> | $Shape<{
  include?: Array<Attribute>,
  exclude?: Array<string>,
}>

export type OrderColumn = string | Function
export type Order = OrderColumn | Array<OrderColumn | [OrderColumn, 'ASC' | 'DESC']>

export type Include = Array<Model | $Shape<{
  model: Model,
  as: string,
  association: Association,
  where: Where,
  or: boolean,
  on: On,
  // not sure if this can be of type Attributes.
  attributes: Array<string>,
  required: boolean,
  separate: boolean,
  limit: number,
  through: $Shape<{
    where: Where,
    // not sure if this can be of type Attributes.
    attributes: Array<string>,
  }>,
  include: Include,
}>>

export type FindOptions = $Shape<{
  where: Where,
  attributes: Attributes,
  paranoid: boolean,
  include: Include,
  order: Order,
  limit: number,
  offset: number,
  transaction: Transaction,
  lock: Lock,
  raw: boolean,
  logging: Function,
  having: Having,
  searchPath: string,
  benchmark: boolean,
}>

export type CountOptions = $Shape<{
  where: Where,
  include: Include,
  distinct: boolean,
  attributes: Attributes,
  group: Group,
  transaction: Transaction,
  logging: Function,
  searchPath: string,
  benchmark: boolean,
}>

export type CreateOptions<Type: Object> = $Shape<{
  raw: boolean,
  isNewRecord: boolean,
  fields: Array<$Keys<Type>>,
  include: Include,
  onDuplicate: string,
  transaction: Transaction,
  logging: Function,
  searchPath: string,
  benchmark: boolean,
}>

export type FindOrCreateOptions<Type: Object> = {
  where: Where,
  defaults?: Type,
  transaction?: Transaction,
}

export type UpdateOptions<Type: Object> = $Shape<{
  where: Where,
  fields: Array<$Keys<Type>>,
  validate: boolean,
  hooks: boolean,
  sideEffects: boolean,
  individualHooks: boolean,
  returning: boolean,
  limit: number,
  logging: Function,
  benchmark: boolean,
  transaction: Transaction,
  silent: boolean,
}>

export type UpsertOptions<Type: Object> = $Shape<{
  validate: boolean,
  fields: Array<$Keys<Type>>,
  hooks: boolean,
  transaction: Transaction,
  logging: Function,
  benchmark: boolean,
}>

export type DestroyOptions = $Shape<{
  where: Where,
  hooks: boolean,
  individualHooks: boolean,
  limit: number,
  force: boolean,
  truncate: boolean,
  cascade: boolean,
  restartIdentity: boolean,
  transaction: Transaction,
  logging: Function,
  benchmark: boolean,
}>

type SetOptions = {
  raw?: boolean,
  reset?: boolean,
}

export type SaveOptions<Type: Object> = $Shape<{
  fields: Array<$Keys<Type>>,
  validate: boolean,
  hooks: boolean,
  returning: boolean,
  searchPath: string,
  logging: Function,
  transaction: Transaction,
  silent: boolean,
}>

export interface InstanceAPI<T: Object> {
  set(field: $Keys<T>, value: any, options?: SetOptions): InstanceAPI<T>;
  set(fields: {[name: $Keys<T>]: any}, options?: SetOptions): InstanceAPI<T>;
  save(options?: SaveOptions<T>): Promise<InstanceAPI<T>>;
  changed(): Array<$Keys<T>>;
  changed(field: $Keys<T>): boolean;
}

