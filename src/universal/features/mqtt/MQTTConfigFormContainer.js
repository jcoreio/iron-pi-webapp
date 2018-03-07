// @flow

import {reduxForm, formValues} from 'redux-form'
import type {Match, RouterHistory} from 'react-router-dom'
import {compose} from 'redux'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import MQTTConfigForm from './MQTTConfigForm'

const configFields = `
  id
  name
  serverURL
  username
  password
  groupId
  nodeId
  minPublishInterval
  publishAllPublicTags
`

const configQuery = gql(`
fragment ChannelFields on MQTTChannelConfig {
  id
  mqttTag
  internalTag
}
query MQTTConfig($id: Int!) {
  Config: MQTTConfig(id: $id) {
    ${configFields}
    channelsFromMQTT {
      ...ChannelFields
    }
    channelsToMQTT {
      ...ChannelFields
    }
  }
}
`)

const createMutation = gql(`
mutation createConfig($values: CreateMQTTConfig!) {
  Config: createMQTTConfig(values: $values) {
    ${configFields}
  }
}
`)

const updateMutation = gql(`
mutation updateConfig($values: UpdateMQTTConfig!) {
  Config: updateMQTTConfig(values: $values) {
    ${configFields}
  }
}
`)

const destroyMutation = gql(`
mutation destroyConfig($id: Int!) {
  destroyMQTTConfig(id: $id)
}
`)


const destroyChannelMutation = gql(`
mutation destroyChannel($id: Int!) {
  destroyMQTTChannelConfig(id: $id)
}
`)

type Props = {
  id?: number,
  match: Match,
  history: RouterHistory,
}

export default compose(
  graphql(createMutation, {
    name: 'createMQTTConfig',
    options: {
      refetchQueries: ['MQTTConfigs']
    },
  }),
  graphql(updateMutation, {
    name: 'updateMQTTConfig',
  }),
  graphql(destroyMutation, {
    name: 'destroyMQTTConfig',
    options: {
      refetchQueries: ['MQTTConfigs']
    },
  }),
  graphql(destroyChannelMutation, {
    name: 'destroyMQTTChannelConfig',
    options: ({id}: Props) => ({
      refetchQueries: [
        {
          query: configQuery,
          variables: {id},
        }
      ]
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
    form: 'MQTTConfig',
    destroyOnUnmount: false,
  }),
  formValues({
    loadedId: 'id',
  })
)(MQTTConfigForm)

