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

    it('applies configs from setChannelConfigs action', () => {
      expect(channelConfigsReducer(
        Map([
          ['1', {mode: 'DISABLED'}],
          ['3', {mode: 'DISABLED'}],
          ['4', {mode: 'DISABLED'}],
        ]),
        setChannelConfigs(
          {channelId: '2', config: {mode: 'ANALOG_INPUT', precision: 1, min: 0, max: 5}},
          {channelId: '3', config: {mode: 'DIGITAL_INPUT', reversePolarity: true}},
          {channelId: '5', config: {mode: 'DIGITAL_OUTPUT', reversePolarity: true, safeState: 0, controlMode: 'REMOTE_CONTROL'}},
          {channelId: '3', config: {mode: 'DIGITAL_INPUT', reversePolarity: false}},
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
        {channelId: 1, config: {mode: 'DISABLED'}},
        {channelId: {foo: 'bar'}, config: {mode: 'DISABLED'}},
        {channelId: null, config: {mode: 'DISABLED'}},
        {config: {mode: 'DISABLED'}},
        {channelId: '1', config: {}},
        {channelId: '1', config: {mode: 'blargh'}},
        {channelId: '1', config: {mode: 'ANALOG_INPUT'}},
        {channelId: '1', config: {mode: 'DIGITAL_INPUT'}},
        {channelId: '1', config: {mode: 'DIGITAL_OUTPUT'}},
        {channelId: '1', config: {mode: 'DIGITAL_OUTPUT', reversePolarity: true, safeState: 1, controlMode: 'LOCAL_CONTROL'}},
      ]) {
        expect(() => channelConfigsReducer(Map(), setChannelConfigs(update))).to.throw(RuntimeTypeError)
      }
    })
    it('rejects control logic cycles', () => {
      let error
      try {
        const commonConfig = {mode: 'DIGITAL_OUTPUT', reversePolarity: true, safeState: 0, controlMode: 'LOCAL_CONTROL'}
        channelConfigsReducer(
          Map([
            ['1', {...commonConfig, controlLogic: [
              {channelId: '2', comparison: 'EQ', threshold: 1},
              {channelId: '4', comparison: 'EQ', threshold: 1},
              {channelId: '5', comparison: 'EQ', threshold: 1},
            ]}],
            ['2', {...commonConfig, controlLogic: [{channelId: '3', comparison: 'EQ', threshold: 1}]}],
            ['3', {...commonConfig, controlLogic: [{channelId: '4', comparison: 'EQ', threshold: 1}]}],
            ['4', {mode: 'DIGITAL_INPUT', reversePolarity: true}],
            ['5', {...commonConfig, controlMode: 'REMOTE_CONTROL'}],
          ]),
          setChannelConfigs(
            {channelId: '3', config: {...commonConfig, controlLogic: [{channelId: '1', comparison: 'EQ', threshold: 1}]}},
            {channelId: '4', config: {mode: 'DIGITAL_INPUT', reversePolarity: false}},
            {channelId: '5', config: {...commonConfig, controlMode: 'FORCE_ON'}},
          )
        )
      } catch (err) {
        error = err
      }
      if (!error) throw new Error('expected channelConfigsReducer to throw an error')
      expect(error.cycle).to.deep.equal(['3', '1', '2'])
    })
    it('rejects setChannelValues actions for unconfigured channels', () => {
      expect(() => channelConfigsReducer(Map(), setChannelValues({channelId: '1', value: {rawAnalogInput: 1}}))).to.throw(Error)
    })
    it("rejects setChannelValues actions that don't match current mode", () => {
      const channelId = '1'
      const initState = (config: ChannelConfig): ChannelConfigs => Map([[channelId, config]])

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
              setChannelValues({channelId, value})
            )).to.equal(state)
          } else {
            expect(() => channelConfigsReducer(
              initState(config),
              setChannelValues({channelId, value})
            )).to.throw(Error)
          }
        }

        for (let config: ChannelConfig of [
          {mode: 'DISABLED'},
          {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'FORCE_OFF'},
          {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'FORCE_ON'},
          {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'LOCAL_CONTROL', controlLogic: [
            {channelId: '2', comparison: 'GTE', threshold: 2},
          ]},
        ]) {
          expect(() => channelConfigsReducer(
            initState(config),
            setChannelValues({channelId, value})
          )).to.throw(Error)
        }
      }
    })
  })
  describe('channelValuesReducer', () => {
    const {channelValuesReducer, setChannelConfigs, setChannelValues} = reduxChannelStates()

    it('sets values from setChannelValues action', () => {
      expect(channelValuesReducer(
        Map([
          ['1', {rawAnalogInput: 1}],
          ['3', {rawDigitalInput: 0}],
          ['4', {controlValue: 0}],
        ]),
        setChannelValues(
          {channelId: '2', value: {rawAnalogInput: 0.2}},
          {channelId: '3', value: {rawDigitalInput: 1}},
          {channelId: '5', value: {controlValue: 1}},
          {channelId: '3', value: {controlValue: null}},
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
        Map([
          ['1', {rawAnalogInput: 1}],
          ['3', {rawDigitalInput: 0}],
          ['4', {controlValue: 0}],
          ['11', {controlValue: 0}],
        ]),
        setChannelConfigs(
          {channelId: '2', config: {mode: 'ANALOG_INPUT'}, value: {rawAnalogInput: 0.2}},
          {channelId: '3', config: {mode: 'DIGITAL_INPUT'}, value: {rawDigitalInput: 1}},
          {channelId: '5', config: {mode: 'DIGITAL_OUTPUT', controlMode: 'REMOTE_CONTROL'}, value: {controlValue: 1}},
          {channelId: '3', config: {mode: 'DIGITAL_OUTPUT', controlMode: 'REMOTE_CONTROL'}, value: {controlValue: null}},
          {channelId: '6', config: {mode: 'ANALOG_INPUT'}},
          {channelId: '7', config: {mode: 'DIGITAL_INPUT'}},
          {channelId: '8', config: {mode: 'DIGITAL_OUTPUT', controlMode: 'FORCE_OFF'}},
          {channelId: '9', config: {mode: 'DIGITAL_OUTPUT', controlMode: 'FORCE_ON'}},
          {channelId: '4', config: {mode: 'DISABLED'}},
          {channelId: '10', config: {mode: 'DIGITAL_OUTPUT', controlMode: 'REMOTE_CONTROL'}},
          {channelId: '11', config: {mode: 'DIGITAL_OUTPUT', controlMode: 'LOCAL_CONTROL'}}
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
    it("doesn't clear current value if mode remains the same", () => {
      expect(channelValuesReducer(
        Map([
          ['1', {rawAnalogInput: 1}],
          ['2', {rawDigitalInput: 0}],
          ['3', {controlValue: 0}],
        ]),
        setChannelConfigs(
          {channelId: '1', config: {mode: 'ANALOG_INPUT'}},
          {channelId: '2', config: {mode: 'DIGITAL_INPUT'}},
          {channelId: '3', config: {mode: 'DIGITAL_OUTPUT', controlMode: 'REMOTE_CONTROL'}},
        )
      ).toJS()).to.deep.equal({
        '1': {rawAnalogInput: 1},
        '2': {rawDigitalInput: 0},
        '3': {controlValue: 0},
      })
    })
    it('rejects invalid values/ids', () => {
      for (let update: any of [
        {channelId: 1, value: {rawAnalogInput: 1}},
        {channelId: {foo: 'bar'}, value: {rawAnalogInput: 1}},
        {channelId: null, value: {rawAnalogInput: 1}},
        {value: {rawAnalogInput: 1}},
        {channelId: '1', value: {}},
        {channelId: '1', value: {mode: 'blargh'}},
        {channelId: '1', value: {rawDigitalInput: 1.5}},
        {channelId: '1', value: {rawDigitalInput: undefined}},
        {channelId: '1', value: {controlValue: 1.5}},
        {channelId: '1', value: {controlValue: undefined}},
      ]) {
        expect(() => channelValuesReducer(Map(), setChannelValues(update))).to.throw(RuntimeTypeError)
      }
      for (let update: any of [
        {channelId: 1, config: {mode: 'ANALOG_INPUT'}, value: {rawAnalogInput: 1}},
        {channelId: {foo: 'bar'}, config: {mode: 'ANALOG_INPUT'}, value: {rawAnalogInput: 1}},
        {channelId: null, config: {mode: 'ANALOG_INPUT'}, value: {rawAnalogInput: 1}},
        {config: {mode: 'ANALOG_INPUT'}, value: {rawAnalogInput: 1}},
        {channelId: '1', config: {mode: 'ANALOG_INPUT'}, value: {}},
        {channelId: '1', config: {mode: 'ANALOG_INPUT'}, value: {mode: 'blargh'}},
        {channelId: '1', config: {mode: 'DIGITAL_INPUT'}, value: {rawDigitalInput: 1.5}},
        {channelId: '1', config: {mode: 'DIGITAL_INPUT'}, value: {rawDigitalInput: undefined}},
        {channelId: '1', config: {mode: 'DIGITAL_OUTPUT'}, value: {controlValue: 1.5}},
        {channelId: '1', config: {mode: 'DIGITAL_OUTPUT'}, value: {controlValue: undefined}},
      ]) {
        expect(() => channelValuesReducer(Map(), setChannelConfigs(update))).to.throw(RuntimeTypeError)
      }
    })
    it('rejects mismatched configs/values', () => {
      const channelId = '1'
      const initState = (value: ChannelValue): ChannelValues => Map([[channelId, value]])

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
              setChannelConfigs({channelId, config, value})
            )
          } else {
            expect(() => channelValuesReducer(
              initState(value),
              setChannelConfigs({channelId, config, value})
            )).to.throw(Error)
          }
        }

        for (let config: ChannelConfig of [
          {mode: 'DISABLED'},
          {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'FORCE_OFF'},
          {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'FORCE_ON'},
          {mode: 'DIGITAL_OUTPUT', reversePolarity: false, safeState: 0, controlMode: 'LOCAL_CONTROL', controlLogic: [
            {channelId: '2', comparison: 'GTE', threshold: 2},
          ]},
        ]) {
          expect(() => channelValuesReducer(
            initState(value),
            setChannelConfigs({channelId, config, value})
          )).to.throw(Error)
        }
      }
    })
  })
})

