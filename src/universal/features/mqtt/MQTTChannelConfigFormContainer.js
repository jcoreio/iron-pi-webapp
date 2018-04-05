// @flow

import {reduxForm, formValues} from 'redux-form'
import type {Match} from 'react-router-dom'
import {compose} from 'redux'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import MQTTChannelConfigForm from './MQTTChannelConfigForm'
import type {Direction} from './MQTTChannelConfigForm'
import type {MetadataItem} from '../../types/MetadataItem'
import updateMetadataItem from '../../apollo/updateMetadataItem'
import {ApolloClient} from "apollo-client"

const metadataItemSelection = `
metadataItem {
  tag
  name
  dataType
  min
  max
  units
  rounding
  displayPrecision
  isDigital
}
`

const configFields = `
  id
  direction
  ${metadataItemSelection}
  configId
  internalTag
  mqttTag
  mqttTagState {
    tag
    v
  }
  internalTagState {
    tag
    v
  }
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

const configChannelsQuery = gql(`query configChannels($id: Int!) {
  MQTTConfig(id: $id) {
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
    options: ({configId}: Props) => ({
      refetchQueries: [
        {
          query: configChannelsQuery,
          variables: {id: configId},
        },
      ],
      options: {
        update: (proxy: ApolloClient, result: {data: {Config: {metadataItem?: MetadataItem}}}) => {
          const {data: {Config: {metadataItem}}} = result
          if (metadataItem) updateMetadataItem(proxy, metadataItem)
        }
      },
    })
  }),
  graphql(updateMutation, {
    name: 'updateMQTTChannelConfig',
    options: {
      update: (proxy: ApolloClient, result: {data: {Config: {metadataItem?: MetadataItem}}}) => {
        const {data: {Config: {metadataItem}}} = result
        if (metadataItem) updateMetadataItem(proxy, metadataItem)
      }
    },
  }),
  graphql(destroyMutation, {
    name: 'destroyMQTTChannelConfig',
    options: ({configId}: Props) => ({
      refetchQueries: [
        {
          query: configChannelsQuery,
          variables: {id: configId},
        },
      ]
    })
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
  }),
  formValues({
    loadedId: 'id',
  })
)(MQTTChannelConfigForm)

