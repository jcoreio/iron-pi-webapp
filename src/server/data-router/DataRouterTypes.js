// @flow

export type DataPluginMapping = {
  id: string, // Unique ID, e.g. "local1"
  name: string, // Descriptive name for this input or output, e.g. "Local 1". This is distinct from the user settable metadata name, e. g. "Pump 1".
  tagsToPlugin?: ?Array<string>,
  tagFromPlugin?: ?string, // Can be null if this is an output that does not publish a tag back to the tag map
}

export interface DataPlugin {
  pluginId(): string;
  inputsChanged(): void;
  updateCycleDone(didInputsChange: boolean): void;
  getMappings(): Array<DataPluginMapping>;
}

export type TimeValuePair = {
  t: number,
  v: any,
}

export type TimestampedValuesMap = {[tag: string]: TimeValuePair}

export type ValuesMap = {[tag: string]: any}

export type DispatchEvent = {
  pluginId: string,
  // The caller can either provide `values` and allow the system to timestamp everything with the current time,
  // or the caller can provide `timestampedValues` if the data has already been timestamped upstream.
  values?: ?ValuesMap,
  timestampedValues?: ?TimestampedValuesMap,
}

export class DataPluginManager {
  pluginConfigChanged() {
  }
  dispatch() {
  }
}
