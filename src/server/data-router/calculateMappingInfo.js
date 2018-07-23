// @flow

import {MAPPING_PROBLEM_MULTIPLE_SOURCES, MAPPING_PROBLEM_NO_SOURCE} from '../../universal/data-router/PluginConfigTypes'
import {INTERNAL} from '../../universal/types/Tag'
import type {MappingLocationInfo, MappingProblem} from '../../universal/data-router/PluginConfigTypes'
import type {PluginAndMappingsInfo, SystemMappingInfo} from './PluginTypes'
import {pluginKey as getPluginKey} from '../../universal/data-router/PluginConfigTypes'
import type {DataPluginMapping} from '../../universal/types/PluginTypes'
import {setCommandToTag} from '../../universal/types/Tag'

type TagSourceInfo = {
  pluginKey: string,
  settable: boolean,
  mappingLocation: MappingLocationInfo,
}

export default function calculateMappingInfo(allPluginMappings: Array<PluginAndMappingsInfo>): SystemMappingInfo {
  const tagsToSources: Map<string, Array<TagSourceInfo>> = new Map()
  const tagsToDestinationPluginKeys: Map<string, Set<string>> = new Map()

  // Step 1: calculate sources and destinations for all tags
  for (let mappingsForPlugin: PluginAndMappingsInfo of allPluginMappings) {
    const {pluginType, pluginId, pluginName, mappings} = mappingsForPlugin
    const pluginKey = getPluginKey(mappingsForPlugin)
    for (let mapping: DataPluginMapping of mappings) {
      const {id: channelId, name: channelName, tagsToPlugin, tagFromPlugin, settable} = mapping
      if (tagFromPlugin) {
        let tagSources: ?Array<TagSourceInfo> = tagsToSources.get(tagFromPlugin)
        if (!tagSources) {
          tagSources = []
          tagsToSources.set(tagFromPlugin, tagSources)
        }
        const mappingLocation: MappingLocationInfo = {
          pluginType, pluginId, pluginName, channelId, channelName
        }
        tagSources.push({pluginKey, settable: !!settable, mappingLocation})
      }
      (tagsToPlugin || []).forEach((tag: string) => {
        let destPluginsForTag: ?Set<string> = tagsToDestinationPluginKeys.get(tag)
        if (!destPluginsForTag) {
          destPluginsForTag = new Set()
          tagsToDestinationPluginKeys.set(tag, destPluginsForTag)
        }
        destPluginsForTag.add(pluginKey)
      })
    }
  }

  const tagsToProviderPluginKeys: Map<string, string> = new Map()
  const duplicateTags: Set<string> = new Set()
  const mappingProblems: Array<MappingProblem> = []

  // Step 2: calculate which tags have multiple sources
  tagsToSources.forEach((sources: Array<TagSourceInfo>, tag: string) => {
    const settableSources = sources.filter(source => source.settable)
    const nonSettableSources = sources.filter(source => !source.settable)
    if (settableSources.length > 1 || nonSettableSources.length > 1) {
      // tag has multiple sources
      duplicateTags.add(tag)
      const mappingLocations: Array<MappingLocationInfo> = sources.map((source: TagSourceInfo) => source.mappingLocation)
      const addedMappingProblems = mappingLocations.map((mappingLocation: MappingLocationInfo, idx: number) => ({
        mappingLocation,
        tag,
        problem: MAPPING_PROBLEM_MULTIPLE_SOURCES,
        additionalSources: mappingLocations.slice(0).splice(idx, 1),
      }))
      mappingProblems.push(...addedMappingProblems)
    } else {
      const source: ?TagSourceInfo = settableSources[0] || nonSettableSources[0]
      if (!source) throw Error('unexpected : source should always be present')
      tagsToProviderPluginKeys.set(tag, source.pluginKey)
    }
  })

  // Step 3: calcualte which tags have missing sources
  for (let mappingsForPlugin: PluginAndMappingsInfo of allPluginMappings) {
    const {pluginType, pluginId, pluginName, mappings} = mappingsForPlugin
    for (let mapping: DataPluginMapping of mappings) {
      const {id: channelId, name: channelName, tagsToPlugin} = mapping
      const mappingLocation: MappingLocationInfo = {
        pluginType, pluginId, pluginName, channelId, channelName
      }
      // Flag missing sources
      ;(tagsToPlugin || []).forEach((tag: string) => {
        // filter out if setCommandToTag is truthy--plugins listen for these tags, but sources
        // don't declare them as outputs
        if (!tagsToProviderPluginKeys.has(tag) && !duplicateTags.has(tag) && !setCommandToTag(tag)) {
          mappingProblems.push({
            mappingLocation,
            tag,
            problem: MAPPING_PROBLEM_NO_SOURCE
          })
        }
      })
    } // end for(let mapping of mappings)
  } // end for(let mappingsForPlugin of allPluginMappings)

  const tags: Array<string> = Array.from(tagsToSources.keys()).sort()
  const publicTags = tags.filter(tag => !tag.startsWith(INTERNAL))
  return {tags, publicTags, tagsToProviderPluginKeys, tagsToDestinationPluginKeys, duplicateTags, mappingProblems}
}
