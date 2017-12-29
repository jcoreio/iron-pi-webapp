// @flow

import * as React from 'react'

import {describe, it} from 'mocha'
import {expect} from 'chai'
import {mount} from 'enzyme'

import {MemoryRouter} from 'react-router'
import App from '../App'

describe('App', () => {
  it('renders home page for /', () => {
    const comp = mount(
      <MemoryRouter
        initialEntries={['/']}
        initialIndex={0}
      >
        <App />
      </MemoryRouter>
    )

    expect(comp.text()).to.equal('Home')
  })
})
