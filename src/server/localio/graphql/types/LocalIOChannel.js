// @flow

import {attributeFields} from 'graphql-sequelize'
import {LocalIOChannelState} from './LocalIOChannelState'
import type {DigitalInputConfig, DigitalOutputConfig} from '../../../../universal/localio/LocalIOChannel'
import LocalIOChannel from '../../models/LocalIOChannel'
import type {Context} from '../../../graphql/Context'
import * as graphql from 'graphql'
import MetadataItem from '../../../graphql/types/MetadataItem'
import {INTERNAL} from '../../../../universal/types/Tag'

export default function createLocalIOChannel(options: {
  attributeFieldsCache: Object,
}): graphql.GraphQLObjectType {
  return new graphql.GraphQLObjectType({
    name: LocalIOChannel.options.name.singular,
    fields: () => ({
      ...attributeFields(LocalIOChannel, {cache: options.attributeFieldsCache}),
      metadataItem: {
        type: MetadataItem,
        description: 'the metadata item for this channel',
        resolve: ({tag}: LocalIOChannel, args: any, {metadataHandler}: Context) => {
          if (tag) {
            const item = metadataHandler.getTagMetadata(tag)
            return item ? {...item, tag} : null
          }
        },
      },
      name: {
        type: graphql.GraphQLString,
        description: 'the name for this channel',
        resolve: ({tag}: LocalIOChannel, args: any, {metadataHandler}: Context) => {
          if (!tag) return null
          const item = metadataHandler.getTagMetadata(tag)
          return item ? item.name : null
        },
      },
      state: {
        type: LocalIOChannelState,
        description: 'the current state of this channel',
        resolve: ({id, tag, config}: LocalIOChannel, args: any, {dataRouter}: Context) => {
          switch (config.mode) {
          case 'ANALOG_INPUT': {
            return {
              mode: 'ANALOG_INPUT',
              rawInput: dataRouter.getTagValue(`${INTERNAL}localio/${id}/rawAnalogInput`),
              systemValue: tag ? dataRouter.getTagValue(tag) : null,
            }
          }
          case 'DIGITAL_INPUT': {
            const {reversePolarity}: DigitalInputConfig = (config: any)
            return {
              mode: 'DIGITAL_INPUT',
              reversePolarity,
              rawInput: dataRouter.getTagValue(`${INTERNAL}localio/${id}/rawDigitalInput`),
              systemValue: tag ? dataRouter.getTagValue(tag) : null,
            }
          }
          case 'DIGITAL_OUTPUT': {
            const {reversePolarity, safeState}: DigitalOutputConfig = (config: any)
            return {
              mode: 'DIGITAL_OUTPUT',
              reversePolarity,
              safeState,
              controlValue: dataRouter.getTagValue(`${INTERNAL}localio/${id}/controlValue`),
              rawOutput: tag ? dataRouter.getTagValue(tag) : null,
            }
          }
          case 'DISABLED': {
            return {mode: 'DISABLED'}
          }
          }
        }
      },
    }),
  })
}
