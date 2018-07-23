// @flow

/**
 * Information about a single mapping into or out of a plugin
 */
export type DataPluginMapping = {
  id: number | string, // Unique ID, e.g. "local1"
  name: string, // Descriptive name for this input or output, e.g. "Local 1". This is distinct from the user settable metadata name, e. g. "Pump 1".
  tagsToPlugin?: ?Array<string>,
  tagFromPlugin?: ?string, // Can be null if this is an output that does not publish a tag back to the tag map
  settable?: ?boolean, // true if another plugin besides the source can also set this tag, false otherwise. Used in the case where the Local IO plugin provides a tag, but the tag can be set from a remote source like MQTT.
}
