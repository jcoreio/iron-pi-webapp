/* @flow */

import * as React from 'react'
import {createStore, combineReducers} from 'redux'
import {reducer as form} from 'redux-form'
import {Provider} from 'react-redux'
import {JssProvider} from 'react-jss'
import createJss from '../universal/jss/createJss'

const reducer = combineReducers({form})
const store = createStore(reducer)

const jss = createJss()

type Props = {
  children: React.Node,
}

export default class Wrapper extends React.Component<Props, void> {
  render(): React.Node {
    return (
      <JssProvider jss={jss}>
        <Provider store={store}>
          {this.props.children}
        </Provider>
      </JssProvider>
    )
  }
}

