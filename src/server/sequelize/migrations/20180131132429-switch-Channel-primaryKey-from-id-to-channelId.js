// @flow

import type SequelizeClass, {QueryInterface} from 'sequelize'

const Channels = 'Channels'

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    const {sequelize} = queryInterface
    await sequelize.query(`DROP INDEX IF EXISTS "${Channels}_pkey"`)

    await queryInterface.renameColumn(Channels, 'id', 'physicalChannelId')
    await queryInterface.renameColumn(Channels, 'channelId', 'id')
    await queryInterface.changeColumn(Channels, 'physicalChannelId', {
      type: Sequelize.INTEGER,
      unique: true,
      allowNull: true,
      validate: {
        min: 0,
      },
    })

    await sequelize.query(`CREATE UNIQUE INDEX "${Channels}_id_idx" on "${Channels}" ("id")`)
    await sequelize.query(`CREATE UNIQUE INDEX "${Channels}_physicalChannelId_idx" on "${Channels}" ("physicalChannelId")`)
  },
  async down(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    const {sequelize} = queryInterface
    await sequelize.query(`ALTER TABLE "${Channels}" DROP CONSTRAINT "${Channels}_physicalChannelId_idx"`)
    await sequelize.query(`ALTER TABLE "${Channels}" DROP CONSTRAINT "${Channels}_id_idx"`)

    await queryInterface.changeColumn(Channels, 'physicalChannelId', {
      type: Sequelize.INTEGER,
      unique: true,
      allowNull: false,
      validate: {
        min: 0,
      },
    })
    await queryInterface.renameColumn(Channels, 'id', 'channelId')
    await queryInterface.renameColumn(Channels, 'physicalChannelId', 'id')

    await sequelize.query(`CREATE UNIQUE INDEX "${Channels}_pkey" on "${Channels}" ("id")`)
  },
}

