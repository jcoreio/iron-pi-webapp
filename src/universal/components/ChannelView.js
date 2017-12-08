// @flow

import * as React from 'react'
import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import {reduxForm, Field, formValues} from 'redux-form/immutable'

export type Props = {
  data: Object,
}

class ChannelView extends React.Component<Props> {
  render(): ?React.Node {
    const {data} = this.props
    return (
      <div>
        <form>
          <Field
            name="channelId"
            type="text"
            placeholder="channelId"
            component="input"
          />
        </form>
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </div>
    )
  }
}

export default compose(
  reduxForm({form: 'channel', initialValues: {channelId: 'channel1'}}),
  formValues('channelId'),
  graphql(
    gql`
      query Channel($channelId: String!) {
        Channel(channelId: $channelId) {
          id
          name
          channelId
          mode
        }
      }
    `,
    {
      options: ({channelId}) => ({
        variables: {channelId},
      })
    }
  )
)(ChannelView)

