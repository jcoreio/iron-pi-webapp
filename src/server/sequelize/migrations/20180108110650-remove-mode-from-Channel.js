// @flow

import type SequelizeClass, {QueryInterface} from 'sequelize'

const Channels = 'Channels'

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    const {sequelize} = queryInterface
    const [channels] = await sequelize.query(`select id, mode, config from "${Channels}"`)
    await channels.map(({id, mode, config}) => sequelize.query(`update "${Channels}" set config = '${JSON.stringify({...config, mode})}'::JSON where "${Channels}".id = ${id}`))
    await queryInterface.removeColumn(Channels, 'mode')
    await sequelize.query(`drop type "enum_${Channels}_mode"`)
  },
  async down(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    const {sequelize} = queryInterface
    await queryInterface.addColumn(Channels, 'mode', {
      type: Sequelize.ENUM('ANALOG_INPUT', 'DIGITAL_INPUT', 'DIGITAL_OUTPUT', 'DISABLED'),
      allowNull: false,
      defaultValue: 'DISABLED',
    })
    const [channels] = await sequelize.query(`select id, config from "${Channels}"`)
    await channels.map(({id, config: {mode, ...config}}) => sequelize.query(`update "${Channels}" set config = '${JSON.stringify(config)}'::JSON, mode = '${mode || 'DISABLED'}' where "${Channels}".id = ${id}`))
  },
}

