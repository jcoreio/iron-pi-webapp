// @flow

import memoize from 'lodash.memoize'
import {createSelector} from 'reselect'
import type {ChannelConfigs, ChannelValues} from './reduxChannelStates'
import type {
  AnalogInputConfig,
  AnalogInputState, Calibration,
  ChannelState, ControlLogic, DigitalInputConfig, DigitalInputState, DigitalOutputConfig, DigitalOutputState,
  DisabledState,
  LocalControlDigitalOutputConfig
} from '../../universal/types/Channel'
import Calibrator from './Calibrator'
import evaluateControlLogic from './evaluateControlLogic'

type Options<S> = {
  selectChannelConfigs: (state: S) => ChannelConfigs,
  selectChannelValues: (state: S) => ChannelValues,
}

export type ChannelStateSelector<S> = (channelId: string) => (state: S) => ?ChannelState

export default function createChannelStateSelector<S>({
  selectChannelConfigs,
  selectChannelValues,
}: Options<S>): ChannelStateSelector<S> {
  const selectChannelState = memoize((channelId: string) => {
    const selectCalibrator: (config: AnalogInputConfig) => Calibrator = createSelector(
      (config: AnalogInputConfig) => config.calibration,
      (calibration: Calibration = {points: []}) => new Calibrator(calibration.points)
    )

    const selectAnalogInputState: (config: AnalogInputConfig, values: ChannelValues) => AnalogInputState = createSelector(
      selectCalibrator,
      (config: AnalogInputConfig, values: ChannelValues) => {
        const value = values.get(channelId)
        let rawInput = value ? (value: any).rawAnalogInput : null
        if (!Number.isFinite(rawInput)) rawInput = null
        return rawInput
      },
      (calibrator: Calibrator, rawInput: number | null): AnalogInputState => {
        const systemValue = rawInput == null ? null : calibrator.calibrate(rawInput)
        return {channelId, mode: 'ANALOG_INPUT', rawInput, systemValue}
      }
    )

    const selectDigitalInputState: (config: DigitalInputConfig, values: ChannelValues) => DigitalInputState = createSelector(
      (config: DigitalInputConfig) => config.reversePolarity,
      (config: DigitalInputConfig, values: ChannelValues) => {
        const value = values.get(channelId)
        let rawInput = value ? (value: any).rawDigitalInput : null
        if (!Number.isFinite(rawInput)) rawInput = null
        return rawInput
      },
      (reversePolarity: boolean = false, rawInput: 0 | 1 | null): DigitalInputState => {
        const systemValue = rawInput == null
          ? null
          : reversePolarity
            ? (rawInput === 0 ? 1 : 0)
            : rawInput
        return {channelId, mode: 'DIGITAL_INPUT', reversePolarity, rawInput, systemValue}
      }
    )

    function createDigitalOutputState(config: DigitalOutputConfig, controlValue: 0 | 1 | null): DigitalOutputState {
      const {reversePolarity, safeState, controlMode} = config
      if (!Number.isFinite(controlValue)) controlValue = null
      let rawOutput = controlValue == null ? safeState : controlValue
      if (reversePolarity) rawOutput = rawOutput ? 0 : 1
      return {channelId, mode: 'DIGITAL_OUTPUT', controlMode, reversePolarity, safeState, controlValue, rawOutput}
    }

    const selectLocalControlState: (config: LocalControlDigitalOutputConfig, state: S) => DigitalOutputState = createSelector(
      (config: LocalControlDigitalOutputConfig) => config,
      createSelector(
        (config: LocalControlDigitalOutputConfig) => config.controlLogic,
        (config, state: S) => state,
        (controlLogic: ControlLogic, state: S) => {
          const result = evaluateControlLogic(controlLogic, {
            getChannelValue: (otherId: string): ?number => {
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
          return result ? 1 : 0
        }
      ),
      createDigitalOutputState
    )

    const selectDigitalOutputState: (config: DigitalOutputConfig, values: ChannelValues) => DigitalOutputState = createSelector(
      (config: DigitalOutputConfig) => config,
      (config: DigitalOutputConfig, values: ChannelValues) => {
        const value = values.get(channelId)
        return value ? (value: any).controlValue : null
      },
      createDigitalOutputState
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
      case 'DISABLED': return ({channelId, mode: 'DISABLED'}: DisabledState)
      }
    }
  })

  return selectChannelState
}

