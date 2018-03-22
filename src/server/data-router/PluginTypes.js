// @flow

import type {PluginInfo, MappingProblem} from '../../universal/data-router/PluginConfigTypes'
import type MetadataHandler from '../metadata/MetadataHandler'
import type SPIHandler from '../localio/SPIHandler'
import type {PubSubEngine} from 'graphql-subscriptions'

/**
 * Information about a single mapping into or out of a plugin
 */
export type DataPluginMapping = {
  id: number | string, // Unique ID, e.g. "local1"
  name: string, // Descriptive name for this input or output, e.g. "Local 1". This is distinct from the user settable metadata name, e. g. "Pump 1".
  tagsToPlugin?: ?Array<string>,
  tagFromPlugin?: ?string, // Can be null if this is an output that does not publish a tag back to the tag map
}

export type InputChangeEvent = {
  time: number,
  changedTags: Set<string>,
  tagMap: TimestampedValuesMap,
}

export type CycleDoneEvent = InputChangeEvent & {
  inputsChanged: boolean,
}

/**
 * Interface for a plugin that can send and receive data.
 * DataPlugins may optionally extend EventEmitter, in which case they can
 * emit data by calling this.emit('data', {tag1: value1, tag2: value2})
 */
export interface DataPlugin {
  pluginInfo(): PluginInfo;
  ioMappings(): Array<DataPluginMapping>;

  /** Called after all plugins have been instantiated and declared their output tags */
  +start?: () => void;

  +inputsChanged?: (event: InputChangeEvent) => void;
  +dispatchCycleDone?: (event: CycleDoneEvent) => void;

  /** Called when system tags are added or removed */
  +tagsChanged?: () => void;

  +destroy?: () => void;
}

// Events emitted by DataPlugins
export const DATA_PLUGIN_EVENT_DATA = 'data'
export const DATA_PLUGIN_EVENT_TIMESTAMPED_DATA = 'timestampedData'
// Emitted by a DataPlugin when it has changed which tags it reads from or writes to
export const DATA_PLUGIN_EVENT_IOS_CHANGED = 'iosChanged'

export type DataPluginEmittedEvents = {
  data: [ValuesMap],
  timestampedData: [TimestampedValuesMap],
  iosChanged: [],
}

/**
 * Declares which resources are made available to DataPlugins
 */
export type DataPluginResources = {
  pubsub: PubSubEngine,
  getTagValue: (tag: string) => any,
  getTagTimestamp: (tag: string) => ?number,
  tags: () => Array<string>,
  publicTags: () => Array<string>,
  metadataHandler: MetadataHandler,
  spiHandler: SPIHandler,
}

/**
 * Feature can optionally extend EventEmitter and emit FEATURE_EVENT_DATA_PLUGINS_CHANGE
 * when DataPlugin instances are added or removed
 */
export interface Feature {
  +createDataPlugins?: (resources: DataPluginResources) => Promise<void>,
  +getDataPlugins?: () => $ReadOnlyArray<DataPlugin>,
}

// Events emitted by Features
export const FEATURE_EVENT_DATA_PLUGINS_CHANGE = 'dataPluginsChange'

export type FeatureEmittedEvents = {
  dataPluginsChange: [],
}

export type TimeValuePair = {
  t: number,
  v: any,
}

export type TimestampedValuesMap = {[tag: string]: TimeValuePair}

export type ValuesMap = {[tag: string]: any}

/**
 * Event that can be fired by calling dataRouter.dispatch(event)
 * Since it is not emitted from a plugin, it must contain the pluginId of the
 * source plugin.
 */
export type DispatchEvent = {
  pluginKey: string,
  // The caller can either provide `values` and allow the system to timestamp everything with the current time,
  // or the caller can provide `timestampedValues` if the data has already been timestamped upstream.
  values?: ?ValuesMap,
  timestampedValues?: ?TimestampedValuesMap,
}

/**
 * Dispatch event with only timestamped data
 */
export type TimestampedDispatchEvent = {
  pluginKey: string,
  timestampedValues: TimestampedValuesMap,
}


/**
 * Information about a single plugin and all of its mappings
 */
export type PluginAndMappingsInfo = {
  pluginType: string,
  pluginId: number | string,
  pluginName: string,
  mappings: Array<DataPluginMapping>,
}

/**
 * Information on all mappings across all plugins
 */
export type SystemMappingInfo = {
  tagsToProviderPluginKeys: Map<string, string>,
  tagsToDestinationPluginKeys: Map<string, Set<string>>,
  tags: Array<string>,
  publicTags: Array<string>,
  duplicateTags: Set<string>,
  mappingProblems: Array<MappingProblem>,
}
