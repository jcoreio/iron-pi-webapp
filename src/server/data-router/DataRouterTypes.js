// @flow

import type {MappingProblem} from '../../universal/data-router/TagMappingTypes'

/**
 * Information about a single mapping into or out of a plugin
 */
export type DataPluginMapping = {
  id: string, // Unique ID, e.g. "local1"
  name: string, // Descriptive name for this input or output, e.g. "Local 1". This is distinct from the user settable metadata name, e. g. "Pump 1".
  tagsToPlugin?: ?Array<string>,
  tagFromPlugin?: ?string, // Can be null if this is an output that does not publish a tag back to the tag map
}

export type InputChangeEvent = {
  time: number,
  changedTags: Set<string>,
}

export type CycleDoneEvent = InputChangeEvent & {
  didInputsChange: boolean,
}

export interface DataPlugin {
  pluginType(): string; // Name of plugin type, e.g. "Local IO", "MQTT"
  pluginInstanceId(): string; // Unique ID for this plugin, e.g. "localIO", "mqtt0"
  pluginInstanceName(): string; // User supplied name for this plugin instance, e.g. "Motor Drive Modbus Connection"

  inputsChanged(event: InputChangeEvent): void;
  digestCycleDone(event: CycleDoneEvent): void;
  ioMappings(): Array<DataPluginMapping>;
}

export type TimeValuePair = {
  t: number,
  v: any,
}

export type TimestampedValuesMap = {[tag: string]: TimeValuePair}

export type ValuesMap = {[tag: string]: any}

/**
 * Raw dispatch event, which may contain non-timestamped data
 */
export type DispatchEvent = {
  pluginId: string,
  // The caller can either provide `values` and allow the system to timestamp everything with the current time,
  // or the caller can provide `timestampedValues` if the data has already been timestamped upstream.
  values?: ?ValuesMap,
  timestampedValues?: ?TimestampedValuesMap,
}

/**
 * Dispatch event with only timestamped data
 */
export type TimestampedDispatchEvent = {
  pluginId: string,
  timestampedValues: TimestampedValuesMap,
}


/**
 * Information about a single plugin and all of its mappings
 */
export type PluginAndMappingsInfo = {
  pluginType: string,
  pluginInstanceId: string,
  pluginInstanceName: string,
  mappings: Array<DataPluginMapping>,
}

/**
 * Information on all mappings across all plugins
 */
export type SystemMappingInfo = {
  tagsToProviderPluginIds: Map<string, string>,
  tagsToDestinationPluginIds: Map<string, Set<string>>,
  duplicateTags: Set<string>,
  mappingProblems: Array<MappingProblem>,
}
