// @flow

import {describe, beforeEach, it} from 'mocha'
import {expect} from 'chai'
import * as React from 'react'
import {mount} from 'enzyme'
import poll from '@jcoreio/poll'

import gql from 'graphql-tag'
import {graphql} from 'react-apollo'

import IntegrationContainer from './IntegrationContainer'
import createApolloClient from './createApolloClient'

describe('Auth', function () {
  this.timeout(30000)

  let client: ApolloClient
  let close: () => void = () => {
  }

  beforeEach(async () => {
    var apollo = await createApolloClient()
    client = apollo.client
    close = apollo.close
  })

  afterEach(() => {
    close()
  })

  it('works', async function (): Promise<void> {
    const UserReceiver = ({data: {currentUser}}) => <div>{currentUser && currentUser.id}</div>
    const Container = graphql(gql(`{
      currentUser {
        id
      }
    }`))(UserReceiver)

    const comp = mount(
      <IntegrationContainer client={client}>
        <Container />
      </IntegrationContainer>
    )
    await poll(
      () => {
        const {currentUser} = comp.update().find(UserReceiver).prop('data')
        expect(currentUser).to.exist
      },
      50
    )
  })
})

