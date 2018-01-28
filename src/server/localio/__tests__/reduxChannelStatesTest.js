// @flow

import {Map} from 'immutable'
import {expect} from 'chai'
import {RuntimeTypeError} from 'flow-runtime'
import reduxChannelStates from '../reduxChannelStates'
import type {ChannelConfigs, ChannelValue, ChannelValues} from '../reduxChannelStates'
import type {ChannelConfig} from '../../../universal/types/Channel'

describe('reduxChannelStates', () => {
  describe('channelConfigsReducer', () => {
    const {channelConfigsReducer, setChannelConfigs, setChannelValues} = reduxChannelStates()

    it('sets configs from setChannelConfigs action', () => {
      expect(channelConfigsReducer(
        Map().withMutations((configs: ChannelConfigs) => {
          configs.set(1, {mode: 'DISABLED'})
          configs.set(3, {mode: 'DISABLED'})
          configs.set(4, {mode: 'DISABLED'})
        }),
        setChannelConfigs(
          {id: 2, config: {mode: 'ANALOG_INPUT', precision: 1, min: 0, max: 5}},
          {id: 3, config: {mode: 'DIGITAL_INPUT', reversePolarity: true}},
          {id: 5, config: {mode: 'DIGITAL_OUTPUT', reversePolarity: true, safeState: 0, controlMode: 'REMOTE_CONTROL'}},
          {id: 3, config: {mode: 'DIGITAL_INPUT', reversePolarity: false}},
        )
      ).toJS()).to.deep.equal({
        '1': {mode: 'DISABLED'},
        '2': {mode: 'ANALOG_INPUT', precision: 1, min: 0, max: 5},
        '3': {mode: 'DIGITAL_INPUT', reversePolarity: false},
        '4': {mode: 'DISABLED'},
        '5': {mode: 'DIGITAL_OUTPUT', reversePolarity: true, safeState: 0, controlMode: 'REMOTE_CONTROL'},
      })
    })
    it('rejects invalid configs/ids', () => {
      for (let update: any of [
        {id: 'a', config: {mode: 'DISABLED'}},
        {id: {foo: 'bar'}, config: {mode: 'DISABLED'}},
        {id: null, config: {mode: 'DISABLED'}},
        {config: {mode: 'DISABLED'}},
        {id: 1, config: {}},
        {id: 1, config: {mode: 'blargh'}},
        {id: 1, config: {mode: 'ANALOG_INPUT'}},
        {id: 1, config: {mode: 'DIGITAL_INPUT'}},
        {id: 1, config: {mode: 'DIGITAL_OUTPUT'}},
        {id: 1, config: {mode: 'DIGITAL_OUTPUT', reversePolarity: true, safeState: 1, controlMode: 'LOCAL_CONTROL'}},
      ]) {
        expect(() => channelConfigsReducer(Map(), setChannelConfigs(update))).to.throw(RuntimeTypeError)
      }
    })
    it('rejects setChannelValues actions for unconfigured channels', () => {
      expect(() => channelConfigsReducer(Map(), setChannelValues({id: 1, value: {rawAnalogInput: 1}}))).to.throw(Error)
    })
    it("rejects setChannelValues actions that don't match current mode", () => {
      const id = 1
      const initState = (config: ChannelConfig): ChannelConfigs => Map().set(id, config)

      for (let value of [
        {rawAnalogInput: 1.2},
        {rawAnalogInput: null},
        {rawDigitalInput: 0},
        {rawDigitalInput: 1},
        {rawDigitalInput: null},
        {controlValue: 0},
        {controlValue: 1},
        {controlValue: null},
      ]) {
        let valueMode
        if ('rawAnalogInput' in value) valueMode = 'ANALOG_INPUT'
        else if ('rawDigitalInput' in value) valueMode = 'DIGITAL_INPUT'
        else if ('controlValue' in value) valueMode = 'DIGITAL_OUTPUT'

        for (let config: ChannelConfig of [
          {mode: 'ANALOG_INPUT', precision: 1, min: 0, max: 5},
          {mode: 'DIGITAL_INPUT', reversePolarity: false},
          {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'REMOTE_CONTROL'},
        ]) {
          if (config.mode === valueMode) {
            const state = initState(config)
            expect(channelConfigsReducer(
              state,
              setChannelValues({id, value})
            )).to.equal(state)
          } else {
            expect(() => channelConfigsReducer(
              initState(config),
              setChannelValues({id, value})
            )).to.throw(Error)
          }
        }

        for (let config: ChannelConfig of [
          {mode: 'DISABLED'},
          {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'FORCE_OFF'},
          {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'FORCE_ON'},
          {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'LOCAL_CONTROL', controlLogic: [
            {channelId: id + 1, comparison: 'GTE', threshold: 2},
          ]},
        ]) {
          expect(() => channelConfigsReducer(
            initState(config),
            setChannelValues({id, value})
          )).to.throw(Error)
        }
      }
    })
  })
  describe('channelValuesReducer', () => {
    const {channelValuesReducer, setChannelConfigs, setChannelValues} = reduxChannelStates()

    it('sets values from setChannelValues action', () => {
      expect(channelValuesReducer(
        Map().withMutations((values: ChannelValues) => {
          values.set(1, {rawAnalogInput: 1})
          values.set(3, {rawDigitalInput: 0})
          values.set(4, {controlValue: 0})
        }),
        setChannelValues(
          {id: 2, value: {rawAnalogInput: 0.2}},
          {id: 3, value: {rawDigitalInput: 1}},
          {id: 5, value: {controlValue: 1}},
          {id: 3, value: {controlValue: null}},
        )
      ).toJS()).to.deep.equal({
        '1': {rawAnalogInput: 1},
        '2': {rawAnalogInput: 0.2},
        '3': {controlValue: null},
        '4': {controlValue: 0},
        '5': {controlValue: 1},
      })
    })
    it('sets values from setChannelConfigs action', () => {
      expect(channelValuesReducer(
        Map().withMutations((values: ChannelValues) => {
          values.set(1, {rawAnalogInput: 1})
          values.set(3, {rawDigitalInput: 0})
          values.set(4, {controlValue: 0})
          values.set(11, {controlValue: 0})
        }),
        setChannelConfigs(
          {id: 2, config: {mode: 'ANALOG_INPUT'}, value: {rawAnalogInput: 0.2}},
          {id: 3, config: {mode: 'DIGITAL_INPUT'}, value: {rawDigitalInput: 1}},
          {id: 5, config: {mode: 'DIGITAL_OUTPUT', controlMode: 'REMOTE_CONTROL'}, value: {controlValue: 1}},
          {id: 3, config: {mode: 'DIGITAL_OUTPUT', controlMode: 'REMOTE_CONTROL'}, value: {controlValue: null}},
          {id: 6, config: {mode: 'ANALOG_INPUT'}},
          {id: 7, config: {mode: 'DIGITAL_INPUT'}},
          {id: 8, config: {mode: 'DIGITAL_OUTPUT', controlMode: 'FORCE_OFF'}},
          {id: 9, config: {mode: 'DIGITAL_OUTPUT', controlMode: 'FORCE_ON'}},
          {id: 4, config: {mode: 'DISABLED'}},
          {id: 10, config: {mode: 'DIGITAL_OUTPUT', controlMode: 'REMOTE_CONTROL'}},
          {id: 11, config: {mode: 'DIGITAL_OUTPUT', controlMode: 'LOCAL_CONTROL'}}
        )
      ).toJS()).to.deep.equal({
        '1': {rawAnalogInput: 1},
        '2': {rawAnalogInput: 0.2},
        '3': {controlValue: null},
        '5': {controlValue: 1},
        '6': {rawAnalogInput: null},
        '7': {rawDigitalInput: null},
        '8': {controlValue: 0},
        '9': {controlValue: 1},
        '10': {controlValue: null},
      })
    })
    it('rejects invalid values/ids', () => {
      for (let update: any of [
        {id: 'a', value: {rawAnalogInput: 1}},
        {id: {foo: 'bar'}, value: {rawAnalogInput: 1}},
        {id: null, value: {rawAnalogInput: 1}},
        {value: {rawAnalogInput: 1}},
        {id: 1, value: {}},
        {id: 1, value: {mode: 'blargh'}},
        {id: 1, value: {rawDigitalInput: 1.5}},
        {id: 1, value: {rawDigitalInput: undefined}},
        {id: 1, value: {controlValue: 1.5}},
        {id: 1, value: {controlValue: undefined}},
      ]) {
        expect(() => channelValuesReducer(Map(), setChannelValues(update))).to.throw(RuntimeTypeError)
      }
      for (let update: any of [
        {id: 'a', config: {mode: 'ANALOG_INPUT'}, value: {rawAnalogInput: 1}},
        {id: {foo: 'bar'}, config: {mode: 'ANALOG_INPUT'}, value: {rawAnalogInput: 1}},
        {id: null, config: {mode: 'ANALOG_INPUT'}, value: {rawAnalogInput: 1}},
        {config: {mode: 'ANALOG_INPUT'}, value: {rawAnalogInput: 1}},
        {id: 1, config: {mode: 'ANALOG_INPUT'}, value: {}},
        {id: 1, config: {mode: 'ANALOG_INPUT'}, value: {mode: 'blargh'}},
        {id: 1, config: {mode: 'DIGITAL_INPUT'}, value: {rawDigitalInput: 1.5}},
        {id: 1, config: {mode: 'DIGITAL_INPUT'}, value: {rawDigitalInput: undefined}},
        {id: 1, config: {mode: 'DIGITAL_OUTPUT'}, value: {controlValue: 1.5}},
        {id: 1, config: {mode: 'DIGITAL_OUTPUT'}, value: {controlValue: undefined}},
      ]) {
        expect(() => channelValuesReducer(Map(), setChannelConfigs(update))).to.throw(RuntimeTypeError)
      }
    })
    it('rejects mismatched configs/values', () => {
      const id = 1
      const initState = (value: ChannelValue): ChannelValues => Map().set(id, value)

      for (let value of [
        {rawAnalogInput: 1.2},
        {rawAnalogInput: null},
        {rawDigitalInput: 0},
        {rawDigitalInput: 1},
        {rawDigitalInput: null},
        {controlValue: 0},
        {controlValue: 1},
        {controlValue: null},
      ]) {
        let valueMode
        if ('rawAnalogInput' in value) valueMode = 'ANALOG_INPUT'
        else if ('rawDigitalInput' in value) valueMode = 'DIGITAL_INPUT'
        else if ('controlValue' in value) valueMode = 'DIGITAL_OUTPUT'

        for (let config: ChannelConfig of [
          {mode: 'ANALOG_INPUT', precision: 1, min: 0, max: 5},
          {mode: 'DIGITAL_INPUT', reversePolarity: false},
          {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'REMOTE_CONTROL'},
        ]) {
          if (config.mode === valueMode) {
            const state = initState(value)
            channelValuesReducer(
              state,
              setChannelConfigs({id, config, value})
            )
          } else {
            expect(() => channelValuesReducer(
              initState(value),
              setChannelConfigs({id, config, value})
            )).to.throw(Error)
          }
        }

        for (let config: ChannelConfig of [
          {mode: 'DISABLED'},
          {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'FORCE_OFF'},
          {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'FORCE_ON'},
          {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'LOCAL_CONTROL', controlLogic: [
            {channelId: id + 1, comparison: 'GTE', threshold: 2},
          ]},
        ]) {
          expect(() => channelValuesReducer(
            initState(value),
            setChannelConfigs({id, config, value})
          )).to.throw(Error)
        }
      }
    })
  })
})

