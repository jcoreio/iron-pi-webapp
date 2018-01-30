// @flow


import {combineReducers} from 'mindfront-redux-utils-immutable'
import reduxChannelStates from '../localio/reduxChannelStates'
import {StateRecord} from './types'

const {channelConfigsReducer, channelValuesReducer, setChannelConfigs, setChannelValues} = reduxChannelStates()

export {setChannelConfigs, setChannelValues}

export const reducer = combineReducers({
  channelConfigs: channelConfigsReducer,
  channelValues: channelValuesReducer,
}, StateRecord)

