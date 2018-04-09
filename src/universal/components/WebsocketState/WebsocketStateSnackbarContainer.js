/* @flow */

import * as React from 'react'
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'
import type {State} from '../../../universal/redux/types'

import WebsocketStateSnackbar from './WebsocketStateSnackbar'
import type {WebsocketState} from '../../apollo/websocketRedux'

const mapStateToProps: (state: State) => {websocketState: WebsocketState} = createStructuredSelector({
  websocketState: state => state.websocket.state,
})

export default connect(mapStateToProps)(WebsocketStateSnackbar)

