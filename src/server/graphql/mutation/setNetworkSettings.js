// @flow

import * as graphql from 'graphql'
import type {GraphQLContext} from '../GraphQLContext'

import {InputNetworkSettings} from '../types/NetworkSettings'
import type {NetworkSettings} from '../../../universal/network-settings/NetworkSettingsCommon'
import {validateNetworkSettings} from '../../../universal/network-settings/NetworkSettingsCommon'
import FlowValidationError from '../FlowValidationError'

export default function createSetNetworkSettings(): graphql.GraphQLFieldConfig<any, GraphQLContext> {
  return {
    type: graphql.GraphQLBoolean,
    args: {
      settings: {
        type: new graphql.GraphQLNonNull(InputNetworkSettings),
      },
    },
    resolve: async (obj: any, {settings}: {settings: NetworkSettings}, {userId, networkSettingsHandler}: GraphQLContext): Promise<any> => {
      if (!userId) throw new Error('You must be logged in to change network settings')
      const validation = validateNetworkSettings(settings)
      if (validation.hasErrors()) throw new FlowValidationError('Invalid settings', 'settings', validation)
      await networkSettingsHandler.setNetworkSettings(settings)
    }
  }
}
