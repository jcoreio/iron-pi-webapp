// @flow

import type SequelizeClass, {QueryInterface} from 'sequelize'
import keyBy from 'lodash.keyby'
import type {Channel} from '../../../universal/types/Channel'

const Channels = 'Channels'

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    const {sequelize} = queryInterface
    const [channels] = await sequelize.query(`select id, "channelId", config from "${Channels}"`)
    const channelsById = keyBy(channels, 'id')
    await channels.map(async ({id, config}: Channel) => {
      if (!config) return
      const {controlLogic} = config
      if (controlLogic) {
        const newConfig = {
          ...config,
          controlLogic: controlLogic.map(condition => ({...condition, channelId: channelsById[condition.channelId].channelId}))
        }
        await sequelize.query(`update "${Channels}" set config = '${JSON.stringify(newConfig)}'::JSON where "${Channels}".id = ${id}`)
      }
    })
  },
  async down(queryInterface: QueryInterface, Sequelize: Class<SequelizeClass>): Promise<void> {
    const {sequelize} = queryInterface
    const [channels] = await sequelize.query(`select id, "channelId", config from "${Channels}"`)
    const channelsByChannelId = keyBy(channels, 'channelId')
    await channels.map(async ({id, config}: Channel) => {
      if (!config) return
      const {controlLogic} = config
      if (controlLogic) {
        const newConfig = {
          ...config,
          controlLogic: controlLogic.map(condition => ({...condition, channelId: channelsByChannelId[condition.channelId].id}))
        }
        await sequelize.query(`update "${Channels}" set config = '${JSON.stringify(newConfig)}'::JSON where "${Channels}".id = ${id}`)
      }
    })
  },
}

