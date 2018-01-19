// @flow

import Sequelize, {Model, Association} from 'sequelize'
import type {
  BelongsToManyGetMany,
  BelongsToManySetMany,
  BelongsToManyAddMany,
  BelongsToManyAddOne,
  BelongsToManyCreateOne,
  BelongsToManyRemoveOne,
  BelongsToManyRemoveMany,
  BelongsToManyHasOne,
  BelongsToManyHasMany,
  BelongsToManyCount,
} from 'sequelize'

import type {UserAttributes, UserInitAttributes} from './User'
import User from './User'
import UserScope from './UserScope'
import type {UserScopeAttributes, UserScopeInitAttributes} from './UserScope'


export type ScopeInitAttributes = {
  id: string;
  description: string;
}

export type ScopeAttributes = ScopeInitAttributes & {
  createdAt: Date;
  updatedAt: Date;
}

export default class Scope extends Model<ScopeAttributes, ScopeInitAttributes> {
  id: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  static Users: Association.BelongsToMany<ScopeAttributes,
    ScopeInitAttributes,
    Scope,
    UserAttributes,
    UserInitAttributes,
    User,
    UserScopeAttributes,
    UserScope> = (null: any)

  getUsers: BelongsToManyGetMany<User>
  setUsers: BelongsToManySetMany<User, number, UserScopeInitAttributes>
  addUsers: BelongsToManyAddMany<User, number, UserScopeInitAttributes>
  addUser: BelongsToManyAddOne<User, number, UserScopeInitAttributes>
  createUser: BelongsToManyCreateOne<UserInitAttributes, User, UserScopeInitAttributes>
  removeUser: BelongsToManyRemoveOne<User, number>
  removeUsers: BelongsToManyRemoveMany<User, number>
  hasUser: BelongsToManyHasOne<User, number>
  hasUsers: BelongsToManyHasMany<User, number>
  countUsers: BelongsToManyCount

  static initAttributes({sequelize}: {sequelize: Sequelize}) {
    super.init({
      id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      description: {
        type: Sequelize.STRING,
      },
    }, {sequelize})
  }

  static initAssociations() {
    this.Users = this.belongsToMany(User, {through: UserScope})
  }
}

