// @flow

import type SequelizeClass, {QueryInterface} from 'sequelize'

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.createTable(
      'Scopes',
      {
        id: {
          type: Sequelize.STRING,
          allowNull: false,
          primaryKey: true,
        },
        description: {
          type: Sequelize.STRING,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      }
    )
    await queryInterface.createTable(
      'UserScopes',
      {
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
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      }
    )
    await Promise.all([
      queryInterface.sequelize.query(`INSERT INTO "Scopes" (id, description, "createdAt", "updatedAt") VALUES (?, ?, ?, ?)`, {
        replacements: ['test:create:token', 'allows a user to create a token for testing purposes', new Date(), new Date()],
      }),
      queryInterface.sequelize.query(`INSERT INTO "Scopes" (id, description, "createdAt", "updatedAt") VALUES (?, ?, ?, ?)`, {
        replacements: ['test:update:channelStates', 'allows a user update channel states for testing purposes', new Date(), new Date()],
      }),
    ])
  },
  async down(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    await queryInterface.dropTable('UserScopes')
    await queryInterface.dropTable('Scopes')
  },
}

