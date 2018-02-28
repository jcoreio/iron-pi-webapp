// @flow

import {reduxForm, formValues} from 'redux-form'
import {compose} from 'redux'
import {graphql} from 'react-apollo'
import gql from 'graphql-tag'
import MQTTConfigForm from './MQTTConfigForm'

const configSelection = `{
  id
  name
  serverURL
  username
  password
  groupId
  nodeId
  minPublishInterval
  publishAllPublicTags
}`

const configQuery = gql(`query Config($id: Int!) {
  Config: MQTTConfig(id: $id) ${configSelection}
}
`)

const createMutation = gql(`
mutation createConfig($values: CreateMQTTConfig!) {
  Config: createMQTTConfig(values: $values) ${configSelection}
}
`)

const updateMutation = gql(`
mutation updateConfig($values: UpdateMQTTConfig!) {
  Config: updateMQTTConfig(values: $values) ${configSelection}
}
`)

type Props = {
  id?: number,
}

export default compose(
  graphql(createMutation, {
    name: 'createMQTTConfig',
  }),
  graphql(updateMutation, {
    name: 'updateMQTTConfig',
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

