// @flow

import _ from 'lodash'

import {MAPPING_PROBLEM_MULTIPLE_SOURCES, MAPPING_PROBLEM_NO_SOURCE} from '../../universal/data-router/TagMappingTypes'
import type {MappingLocationInfo, MappingProblem} from '../../universal/data-router/TagMappingTypes'
import type {DataPluginMapping, PluginAndMappingsInfo, SystemMappingInfo} from './DataRouterTypes'

export default function calculateMappingInfo(allPluginMappings: Array<PluginAndMappingsInfo>): SystemMappingInfo {
  const tagsToProviderPluginIds: Map<string, string> = new Map()
  const tagsToDestinationPluginIds: Map<string, Set<string>> = new Map()
  const duplicateTags: Set<string> = new Set()
  const mappingProblems: Array<MappingProblem> = []

  // Pass 1: Build mapping from tag to source plugin ID, and identify duplicate tags
  for (let mappingsForPlugin: PluginAndMappingsInfo of allPluginMappings) {
    const {pluginInstanceId, mappings} = mappingsForPlugin
    for (let mapping: DataPluginMapping of mappings) {
      const {tagFromPlugin, tagsToPlugin} = mapping
      if (tagFromPlugin) {
        if (tagsToProviderPluginIds.has(tagFromPlugin)) {
          // Multiple sources
          duplicateTags.add(tagFromPlugin)
        } else {
          tagsToProviderPluginIds.set(tagFromPlugin, pluginInstanceId)
        }
      }
      (tagsToPlugin || []).forEach((tag: string) => {
        let pluginIdsForTag: ?Set<string> = tagsToDestinationPluginIds.get(tag)
        if (!pluginIdsForTag) {
          pluginIdsForTag = new Set()
          tagsToDestinationPluginIds.set(tag, pluginIdsForTag)
        }
        pluginIdsForTag.add(pluginInstanceId)
      })
    }
  }
  duplicateTags.forEach(tag => tagsToProviderPluginIds.delete(tag))

  // Pass 2: Build arrays of sources for all duplicate tags, and add mapping problem
  // info for all missing tags
  const duplicateTagsToLocations: Map<string, Array<MappingLocationInfo>> = new Map()
  for (let mappingsForPlugin: PluginAndMappingsInfo of allPluginMappings) {
    const {pluginType, pluginInstanceId, pluginInstanceName, mappings} = mappingsForPlugin
    for (let mapping: DataPluginMapping of mappings) {
      const {id: channelId, name: channelName, tagsToPlugin, tagFromPlugin} = mapping
      const mappingLocation: MappingLocationInfo = {
        pluginType, pluginInstanceId, pluginInstanceName, channelId, channelName
      }
      // Build up arrays of duplicate sources
      if (tagFromPlugin && duplicateTags.has(tagFromPlugin)) {
        let mappingLocations: ?Array<MappingLocationInfo> = duplicateTagsToLocations.get(tagFromPlugin)
        if (!mappingLocations) {
          mappingLocations = []
          duplicateTagsToLocations.set(tagFromPlugin, mappingLocations)
        }
        mappingLocations.push(mappingLocation)
      }
      // Flag missing sources
      (tagsToPlugin || []).forEach((tag: string) => {
        if (!tagsToProviderPluginIds.has(tag)) {
          mappingProblems.push({
            mappingLocation,
            tag,
            problem: MAPPING_PROBLEM_NO_SOURCE
          })
        }
      })
    } // end for(let mapping of mappings)
  } // end for(let mappingsForPlugin of allPluginMappings)

  // Now that we know every source of each tag with duplicate sources, create an individual entry
  // for each source
  duplicateTagsToLocations.forEach((mappingLocations: Array<MappingLocationInfo>, tag: string) => {
    _.range(mappingLocations.length).forEach((locationIdx: number) => {
      mappingProblems.push({
        mappingLocation: mappingLocations[locationIdx],
        tag,
        problem: MAPPING_PROBLEM_MULTIPLE_SOURCES,
        additionalSources: mappingLocations.slice(0).splice(locationIdx, 1)
      })
    })
  })

  return {tagsToProviderPluginIds, tagsToDestinationPluginIds, duplicateTags, mappingProblems}
}
