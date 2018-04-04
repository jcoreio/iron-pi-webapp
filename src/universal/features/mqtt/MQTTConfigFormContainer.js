// @flow

import * as React from 'react'
import {reduxForm} from 'redux-form'
import type {Match, RouterHistory} from 'react-router-dom'
import {compose} from 'redux'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import MQTTConfigForm from './MQTTConfigForm'
import {setIn} from '@jcoreio/mutate/lib/index'
import type {MQTTPluginState} from '../../types/MQTTPluginState'
import MQTTChannelStateSubscriptions from './MQTTChannelStateSubscriptions'
import type {MQTTConfig} from './MQTTConfigForm'

const MQTTConfigFormContainer = (props: Props) => {
  return (
    <React.Fragment>
      {props.data && props.data.Config && (
        <MQTTChannelStateSubscriptions config={props.data.Config} />
      )}
      <MQTTConfigForm {...props} />
    </React.Fragment>
  )
}

const configFields = `
  id
  name
  serverURL
  protocol
  username
  password
  groupId
  nodeId
  dataTopic
  metadataTopic
  minPublishInterval
  publishAllPublicTags
`

const configQuery = gql(`
fragment MQTTConfigFormTagStateFields on TagState {
  tag
  v
}
fragment MQTTConfigFormChannelFields on MQTTChannelConfig {
  id
  mqttTag
  internalTag
  mqttTagState {
    ...MQTTConfigFormTagStateFields
  }
  internalTagState {
    ...MQTTConfigFormTagStateFields
  }
  metadataItem {
    tag
    dataType
    isDigital
    units
    displayPrecision
  }
}
query MQTTConfig($id: Int!) {
  Config: MQTTConfig(id: $id) {
    ${configFields}
    channelsFromMQTT {
      ...MQTTConfigFormChannelFields
    }
    channelsToMQTT {
      ...MQTTConfigFormChannelFields
    }
    state {
      id
      status
      connectedSince
      error
    }
  }
}
`)

const stateSubscription = gql(`subscription pluginState($id: Int!) {
  MQTTPluginState(id: $id) {
    id
    status
    connectedSince
    error
  }
}`)

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
  data: {
    Config: MQTTConfig,
  },
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
    props: props => ({
      ...props,
      subscribeToConfigState: (id: number) => props.data.subscribeToMore({
        document: stateSubscription,
        variables: {id},
        updateQuery: (prev: Object, update: {subscriptionData: {data: {MQTTPluginState: MQTTPluginState}, errors?: Array<Error>}}) => {
          const {subscriptionData: {data, errors}} = (update: any)
          if (errors) {
            errors.forEach(error => console.error(error.message)) // eslint-disable-line no-console
            return prev
          }
          if (!data) return prev
          const {MQTTPluginState: newState} = data
          if (!newState) return prev
          return setIn(prev, ['Config', 'state'], newState)
        },
      })
    }),
  }),
  reduxForm({
    form: 'MQTTConfig',
  })
)(MQTTConfigFormContainer)

