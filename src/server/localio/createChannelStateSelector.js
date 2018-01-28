// @flow

import memoize from 'lodash.memoize'
import {createSelector} from 'reselect'
import type {ChannelConfigs, ChannelValue, ChannelValues} from './reduxChannelStates'
import type {
  AnalogInputConfig,
  AnalogInputState, Calibration,
  ChannelState, DigitalInputConfig, DigitalInputState, DigitalOutputConfig, DigitalOutputState, DisabledState,
  LocalControlDigitalOutputConfig
} from '../../universal/types/Channel'
import Calibrator from './Calibrator'
import evaluateControlLogic from './evaluateControlLogic'

type Options<S> = {
  selectChannelConfigs: (state: S) => ChannelConfigs,
  selectChannelValues: (state: S) => ChannelValues,
}

type ChannelStateSelector<S> = (channelId: number) => (state: S) => ?ChannelState

export default function createChannelStateSelector<S>({
  selectChannelConfigs,
  selectChannelValues,
}: Options<S>): ChannelStateSelector<S> {
  const selectChannelState = memoize((channelId: number) => {
    const selectCalibrator: (config: AnalogInputConfig) => Calibrator = createSelector(
      (config: AnalogInputConfig) => config.calibration,
      (calibration: Calibration = {points: []}) => new Calibrator(calibration.points)
    )

    const selectAnalogInputState: (config: AnalogInputConfig, values: ChannelValues) => AnalogInputState = createSelector(
      selectCalibrator,
      (config, values) => values.get(channelId),
      (calibrator: Calibrator, value: ChannelValue): AnalogInputState => {
        let rawInput = value ? (value: any).rawAnalogInput : null
        if (!Number.isFinite(rawInput)) rawInput = null
        const systemValue = rawInput == null ? null : calibrator.calibrate(rawInput)
        return {id: channelId, mode: 'ANALOG_INPUT', rawInput, systemValue}
      }
    )

    const selectDigitalInputState: (config: DigitalInputConfig, values: ChannelValues) => DigitalInputState = createSelector(
      (config: DigitalInputConfig) => config.reversePolarity,
      (config, values) => values.get(channelId),
      (reversePolarity: boolean = false, value: ChannelValue): DigitalInputState => {
        let rawInput = value ? (value: any).rawDigitalInput : null
        if (!Number.isFinite(rawInput)) rawInput = null
        const systemValue = rawInput == null
          ? null
          : reversePolarity
            ? (rawInput === 0 ? 1 : 0)
            : rawInput
        return {id: channelId, mode: 'DIGITAL_INPUT', reversePolarity, rawInput, systemValue}
      }
    )

    function createDigitalOutputState(config: DigitalOutputConfig, controlValue: 0 | 1 | null): DigitalOutputState {
      const {reversePolarity, safeState, controlMode} = config
      if (!Number.isFinite(controlValue)) controlValue = null
      let rawOutput = controlValue == null ? safeState : controlValue
      if (reversePolarity) rawOutput = rawOutput ? 0 : 1
      return {id: channelId, mode: 'DIGITAL_OUTPUT', controlMode, reversePolarity, safeState, controlValue, rawOutput}
    }

    const selectLocalControlState: (config: LocalControlDigitalOutputConfig, state: S) => DigitalOutputState = createSelector(
      (config: LocalControlDigitalOutputConfig) => config,
      (config, state: S) => state,
      (config: LocalControlDigitalOutputConfig, state: S) => {
        const {controlLogic} = config
        const result = evaluateControlLogic(controlLogic, {
          getChannelValue: (otherId: number): ?number => {
            const channelState = selectChannelState(otherId)(state)
            if (channelState == null) return null
            switch (channelState.mode) {
            case 'ANALOG_INPUT': return channelState.systemValue
            case 'DIGITAL_INPUT': return channelState.systemValue
            case 'DIGITAL_OUTPUT': return channelState.rawOutput
            case 'DISABLED': return null
            }
          }
        })
        return createDigitalOutputState((config: any), result ? 1 : 0)
      }
    )

    const selectDigitalOutputState: (config: DigitalOutputConfig, values: ChannelValues) => DigitalOutputState = createSelector(
      (config: DigitalOutputConfig) => config,
      (config, values) => values.get(channelId),
      (config: DigitalOutputConfig, value: ChannelValue): DigitalOutputState => {
        let controlValue = value ? (value: any).controlValue : null
        return createDigitalOutputState(config, controlValue)
      }
    )

    const selectConfig = createSelector(
      selectChannelConfigs,
      configs => configs.get(channelId)
    )

    return (state: S) => {
      const config = selectConfig(state)
      if (config == null) return null
      if (config.controlMode === 'LOCAL_CONTROL') return selectLocalControlState(config, state)
      const values = selectChannelValues(state)
      switch (config.mode) {
      case 'ANALOG_INPUT': return selectAnalogInputState((config: any), values)
      case 'DIGITAL_INPUT': return selectDigitalInputState((config: any), values)
      case 'DIGITAL_OUTPUT': return selectDigitalOutputState((config: any), values)
      case 'DISABLED': return ({id: channelId, mode: 'DISABLED'}: DisabledState)
      }
    }
  })

  return selectChannelState
}

