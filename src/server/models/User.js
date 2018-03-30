// @flow

import Sequelize, {Model, Association} from 'sequelize'
import bcrypt from 'bcrypt'
import promisify from 'es6-promisify'
//import zxcvbn from 'zxcvbn'
import Scope from './Scope'
import type {ScopeAttributes, ScopeInitAttributes} from './Scope'
import UserScope from './UserScope'
import type {UserScopeAttributes, UserScopeInitAttributes} from './UserScope'

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

export type UserInitAttributes = {
  username: string;
  password: string;
}

export type UserAttributes = UserInitAttributes & {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  passwordHasBeenSet: boolean;
  Scopes?: Array<Scope>;
}

async function hashPasswordHook(user: User): Promise<void> {
  if (!user.changed('password')) return
  const hash = await promisify(pw => bcrypt.hash(pw, 10))(user.get('password'))
  user.set('password', hash)
}

export default class User extends Model<UserAttributes, UserInitAttributes> {
  username: string;
  password: string;
  passwordHasBeenSet: boolean;
  id: number;
  createdAt: Date;
  updatedAt: Date;
  Scopes: ?Array<Scope>;

  static Scopes: Association.BelongsToMany<UserAttributes,
    UserInitAttributes,
    User,
    ScopeAttributes,
    ScopeInitAttributes,
    Scope,
    UserScopeAttributes,
    UserScope> = (null: any)

  getScopes: BelongsToManyGetMany<Scope>
  setScopes: BelongsToManySetMany<Scope, string, UserScopeInitAttributes>
  addScopes: BelongsToManyAddMany<Scope, string, UserScopeInitAttributes>
  addScope: BelongsToManyAddOne<Scope, string, UserScopeInitAttributes>
  createScope: BelongsToManyCreateOne<ScopeInitAttributes, Scope, UserScopeInitAttributes>
  removeScope: BelongsToManyRemoveOne<Scope, string>
  removeScopes: BelongsToManyRemoveMany<Scope, string>
  hasScope: BelongsToManyHasOne<Scope, string>
  hasScopes: BelongsToManyHasMany<Scope, string>
  countScopes: BelongsToManyCount

  static initAttributes({sequelize}: {sequelize: Sequelize}) {
    super.init({
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          not: /\s/,
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        // validate: {
        //   isStrongEnough(password: string) {
        //     const result = zxcvbn(password)
        //     if (result.score <= 2) {
        //       const message = [result.feedback.warning + '.', ...result.feedback.suggestions].join('\n')
        //       throw new Error(message)
        //     }
        //   }
        // }
      },
      passwordHasBeenSet: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    }, {sequelize})

    this.beforeCreate(hashPasswordHook)
    this.beforeUpdate(hashPasswordHook)
  }

  static initAssociations() {
    this.Scopes = this.belongsToMany(Scope, {through: UserScope})
  }
}

