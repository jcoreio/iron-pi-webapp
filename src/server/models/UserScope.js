// @flow

import Sequelize, {Model} from 'sequelize'

export type UserScopeInitAttributes = {
  UserId: number;
  ScopeId: number;
}

export type UserScopeAttributes = UserScopeInitAttributes & {
}

export default class UserScope extends Model<UserScopeAttributes, UserScopeInitAttributes> {
  UserId: number;
  ScopeId: number;

  static initAttributes({sequelize}: {sequelize: Sequelize}) {
    super.init({
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        }
      },
      ScopeId: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Scopes',
          key: 'id',
        }
      },
    }, {sequelize})
  }

  static initAssociations() {
  }
}
