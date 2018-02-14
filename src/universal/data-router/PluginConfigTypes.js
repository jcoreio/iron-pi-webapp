// @flow

export const INTERNAL_TAG_PREFIX = '_internal/'

export type PluginInfo = {
  pluginType: string,
  pluginId: string,
  pluginName: string,
}

/**
 * Information about one location where the user has incorrectly mapped something.
 */
export type MappingLocationInfo = {
  pluginType: string,
  pluginId: string,
  pluginName: string,
  channelId: string,
  channelName: string,
}

export const MAPPING_PROBLEM_MULTIPLE_SOURCES = 'multipleSources'
export const MAPPING_PROBLEM_NO_SOURCE = 'noSource'

/**
 * Information about a mapping conflict at a specific location. If there are
 * multiple sources for a tag, one TagConflictInfo will be generated for each
 * source.
 */
export type MappingProblem = {
  mappingLocation: MappingLocationInfo,
  tag: string,
  problem: 'multipleSources' | 'noSource',
  // Additional places where this tag is sourced, if this is a multipleSources problem
  additionalSources?: Array<MappingLocationInfo>,
}

export type TagMetadata = {
  name: string,
  units: string,
  min: number,
  max: number,
  displayPrecision: number,
  storagePrecision: number,
}

export type TagMetadataMap = {[tag: string]: TagMetadata}
