// @flow

import _ from 'lodash'

import {MAPPING_PROBLEM_MULTIPLE_SOURCES, MAPPING_PROBLEM_NO_SOURCE} from '../../universal/data-router/PluginConfigTypes'
import {INTERNAL} from '../../universal/types/Tag'
import type {MappingLocationInfo, MappingProblem} from '../../universal/data-router/PluginConfigTypes'
import type {DataPluginMapping, PluginAndMappingsInfo, SystemMappingInfo} from './PluginTypes'
import {pluginKey as getPluginKey} from '../../universal/data-router/PluginConfigTypes'

export default function calculateMappingInfo(allPluginMappings: Array<PluginAndMappingsInfo>): SystemMappingInfo {
  const allTags: Set<string> = new Set()
  const tagsToProviderPluginKeys: Map<string, string> = new Map()
  const tagsToDestinationPluginKeys: Map<string, Set<string>> = new Map()
  const duplicateTags: Set<string> = new Set()
  const mappingProblems: Array<MappingProblem> = []

  // Pass 1: Build mapping from tag to source plugin ID, and identify duplicate tags
  for (let mappingsForPlugin: PluginAndMappingsInfo of allPluginMappings) {
    const {mappings} = mappingsForPlugin
    const pluginKey = getPluginKey(mappingsForPlugin)
    for (let mapping: DataPluginMapping of mappings) {
      const {tagFromPlugin, tagsToPlugin} = mapping
      if (tagFromPlugin) {
        allTags.add(tagFromPlugin)
        if (tagsToProviderPluginKeys.has(tagFromPlugin)) {
          // Multiple sources
          duplicateTags.add(tagFromPlugin)
        } else {
          tagsToProviderPluginKeys.set(tagFromPlugin, pluginKey)
        }
      }
      (tagsToPlugin || []).forEach((tag: string) => {
        let pluginKeysForTag: ?Set<string> = tagsToDestinationPluginKeys.get(tag)
        if (!pluginKeysForTag) {
          pluginKeysForTag = new Set()
          tagsToDestinationPluginKeys.set(tag, pluginKeysForTag)
        }
        pluginKeysForTag.add(pluginKey)
      })
    }
  }
  duplicateTags.forEach(tag => tagsToProviderPluginKeys.delete(tag))

  // Pass 2: Build arrays of sources for all duplicate tags, and add mapping problem
  // info for all missing tags
  const duplicateTagsToLocations: Map<string, Array<MappingLocationInfo>> = new Map()
  for (let mappingsForPlugin: PluginAndMappingsInfo of allPluginMappings) {
    const {pluginType, pluginId, pluginName, mappings} = mappingsForPlugin
    for (let mapping: DataPluginMapping of mappings) {
      const {id: channelId, name: channelName, tagsToPlugin, tagFromPlugin} = mapping
      const mappingLocation: MappingLocationInfo = {
        pluginType, pluginId, pluginName, channelId, channelName
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
        if (!tagsToProviderPluginKeys.has(tag)) {
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

  const tags: Array<string> = Array.from(allTags).sort()
  const publicTags = tags.filter(tag => !tag.startsWith(INTERNAL))
  return {tags, publicTags, tagsToProviderPluginKeys, tagsToDestinationPluginKeys, duplicateTags, mappingProblems}
}
