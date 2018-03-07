// @flow

import {reduxForm, formValues} from 'redux-form'
import type {Match} from 'react-router-dom'
import {compose} from 'redux'
import {graphql} from 'react-apollo'
import type {ApolloClient} from 'apollo-client'
import gql from 'graphql-tag'
import MQTTChannelConfigForm from './MQTTChannelConfigForm'
import type {Direction} from './MQTTChannelConfigForm'

const metadataItemSelection = `
metadataItem {
  _id
  tag
  name
  dataType
  ... on NumericMetadataItem {
    min
    max
    units
    storagePrecision
    displayPrecision
  }
  ... on DigitalMetadataItem {
    isDigital
  }
}
`

const configFields = `
  id
  direction
  ${metadataItemSelection}
  configId
  internalTag
  mqttTag
  enabled
  name
  multiplier
  offset
`

const configQuery = gql(`
query Config($id: Int!) {
  Config: MQTTChannelConfig(id: $id) {
    ${configFields}
  }
}
`)

type MQTTConfigWithChannels = {
  id: number,
  channelsToMQTT: Array<{id: number}>,
  channelsFromMQTT: Array<{id: number}>,
}

const configChannelsQuery = gql(`query {
  Config: MQTTConfig(id: $id) {
    id
    channelsToMQTT {
      id
    }
    channelsFromMQTT {
      id
    }
  }
}
`)

const createMutation = gql(`
mutation createConfig($values: CreateMQTTChannelConfig!) {
  Config: createMQTTChannelConfig(values: $values) {
    ${configFields}
  }
}
`)

const updateMutation = gql(`
mutation updateConfig($values: UpdateMQTTChannelConfig!) {
  Config: updateMQTTChannelConfig(values: $values) {
    ${configFields}
  }
}
`)

const destroyMutation = gql(`
mutation destroyConfig($id: Int!) {
  destroyMQTTChannelConfig(id: $id)
}
`)

type Props = {
  id?: number,
  configId: number,
  direction?: Direction,
  match: Match,
}

export default compose(
  graphql(createMutation, {
    name: 'createMQTTChannelConfig',
    options: {
      update: (proxy: ApolloClient, {data: {Config: Channel}}: { data: { Config: { id: number, configId: number, direction: Direction } } }) => {
        const data = proxy.readQuery({
          query: configChannelsQuery,
          variables: {id: Channel.configId},
        })
        const {Config} = (data: {Config: MQTTConfigWithChannels})
        if (Config) {
          Config[Channel.direction === 'TO_MQTT' ? 'channelsToMQTT' : 'channelsFromMQTT'].push(Channel)
          proxy.writeQuery({
            query: configChannelsQuery,
            variables: {id: Channel.configId},
            data,
          })
        }
      },
    },
  }),
  graphql(updateMutation, {
    name: 'updateMQTTChannelConfig',
  }),
  graphql(destroyMutation, {
    name: 'destroyMQTTChannelConfig',
    options: ({id, configId}: Props) => ({
      update: (proxy: ApolloClient) => {
        const data = proxy.readQuery({
          query: configChannelsQuery,
          variables: {id: configId},
        })
        const {Config} = (data: {Config: MQTTConfigWithChannels})
        if (Config) {
          Config.channelsFromMQTT = Config.channelsFromMQTT.filter(channel => channel.id !== id)
          Config.channelsToMQTT = Config.channelsToMQTT.filter(channel => channel.id !== id)
          proxy.writeQuery({
            query: configChannelsQuery,
            variables: {id: configId},
            data,
          })
        }
      },
    }),
  }),
  graphql(configQuery, {
    options: ({id}: Props) => ({
      variables: {id},
      errorPolicy: 'all',
    }),
    skip: ({id}: Props) => !Number.isFinite(id),
  }),
  reduxForm({
    form: 'MQTTChannelConfig',
    destroyOnUnmount: false,
  }),
  formValues({
    loadedId: 'id',
  })
)(MQTTChannelConfigForm)

