// @flow

import Sequelize, {Model} from 'sequelize'
import bcrypt from 'bcrypt'
import promisify from 'es6-promisify'
import zxcvbn from 'zxcvbn'

export type UserInitAttributes = {
  username: string;
  password: string;
}

export type UserAttributes = UserInitAttributes & {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

async function hashPasswordHook(user: User): Promise<void> {
  if (!user.changed('password')) return
  const hash = await promisify(pw => bcrypt.hash(pw, 10))(user.get('password'))
  user.set('password', hash)
}

export default class User extends Model<UserAttributes, UserInitAttributes> {
  username: string;
  password: string;
  id: number;
  createdAt: Date;
  updatedAt: Date;

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
        validate: {
          isStrongEnough(password: string) {
            const result = zxcvbn(password)
            if (result.score <= 2) {
              const message = [result.feedback.warning + '.', ...result.feedback.suggestions].join('\n')
              throw new Error(message)
            }
          }
        }
      },
    }, {sequelize})

    this.beforeCreate(hashPasswordHook)
    this.beforeUpdate(hashPasswordHook)
  }

  static initAssociations() {
  }
}

