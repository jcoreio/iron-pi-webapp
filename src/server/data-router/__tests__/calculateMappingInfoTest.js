import {expect} from 'chai'

import _ from 'lodash'

import calculateMappingInfo from '../calculateMappingInfo'
import type {DataPluginMapping} from '../PluginTypes'
import {
  MAPPING_PROBLEM_MULTIPLE_SOURCES,
  MAPPING_PROBLEM_NO_SOURCE
} from '../../../universal/data-router/PluginConfigTypes'

const toPluginId = magic => `pluginId${magic}`

const infoForPlugin = (magic: number) => ({
  pluginType: `pluginType${magic}`,
  pluginId: toPluginId(magic),
  pluginName: `Plugin Instance Name ${magic}`
})

const toPluginAndMappingsInfo = (mappingsForAllPlugins: Array<Array<DataPluginMapping>>) =>
  mappingsForAllPlugins.map((mappings: Array<DataPluginMapping>, pluginIdx: number) =>
    ({...infoForPlugin(pluginIdx), mappings}))

function checkDestinations(actual, expected) {
  expect(actual.size).to.equal(Object.keys(expected).length)
  _.forOwn(expected, (expectedPluginIndices: Array<number>, tag: string) => {
    const pluginIds = Array.from(actual.get(tag) || new Set()).sort()
    expect(pluginIds).to.deep.equal(expectedPluginIndices.map(toPluginId))
  })
}

describe('calculateMappingInfo', () => {
  it('calculates mappings where there are no problems', () => {
    const mappingsForAllPlugins: Array<Array<DataPluginMapping>> = [
      [ // Plugin 1: Local IO
        {
          id: 'local1',
          name: 'Local 1',
          tagFromPlugin: 'tag1'
        },
        {
          id: 'local2',
          name: 'Local 2',
          tagFromPlugin: 'tag2'
        },
        {
          id: 'local3',
          name: 'Local 3',
          tagsToPlugin: ['tag3']
        },
        {
          id: 'local4',
          name: 'Local 4',
          tagsToPlugin: ['tag4', 'tag5']
        }
      ],
      [ // Plugin 2: MQTT
        {
          id: 'mqtt1',
          name: 'MQTT 1',
          tagsToPlugin: ['tag1']
        },
        {
          id: 'mqtt2',
          name: 'MQTT 2',
          tagsToPlugin: ['tag1', 'tag2']
        },
        {
          id: 'mqtt3',
          name: 'MQTT 3',
          tagFromPlugin: 'tag3'
        },
        {
          id: 'mqtt4',
          name: 'MQTT 4',
          tagFromPlugin: 'tag4'
        },
        {
          id: 'mqtt5',
          name: 'MQTT 5',
          tagFromPlugin: 'tag5'
        }
      ]
    ]
    const {tags, publicTags, tagsToProviderPluginIds, tagsToDestinationPluginIds, duplicateTags, mappingProblems} =
      calculateMappingInfo(toPluginAndMappingsInfo(mappingsForAllPlugins))

    const expectedTags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
    expect(tags).to.deep.equal(expectedTags)
    expect(publicTags).to.deep.equal(expectedTags)

    ;['tag1', 'tag2'].forEach(tag => expect(tagsToProviderPluginIds.get(tag)).to.equal('pluginId0'))
    ;['tag3', 'tag4', 'tag5'].forEach(tag => expect(tagsToProviderPluginIds.get(tag)).to.equal('pluginId1'))

    checkDestinations(tagsToDestinationPluginIds, {
      tag1: [1],
      tag2: [1],
      tag3: [0],
      tag4: [0],
      tag5: [0]
    })

    expect(duplicateTags.size).to.equal(0)
    expect(mappingProblems.length).to.equal(0)
  })

  it('identifies duplicate sources', () => {
    // Mappings with conflicts for tag2 and tag3
    const mappingsForAllPlugins: Array<Array<DataPluginMapping>> = [
      [ // Plugin 1: Local IO
        {
          id: 'local1',
          name: 'Local 1',
          tagFromPlugin: 'tag1'
        },
        {
          id: 'local2',
          name: 'Local 2',
          tagFromPlugin: 'tag2'
        },
        {
          id: 'local3',
          name: 'Local 3',
          tagFromPlugin: 'tag3'
        },
        {
          id: 'local4',
          name: 'Local 4',
          tagsToPlugin: ['tag4', 'tag5']
        }
      ],
      [ // Plugin 2: MQTT
        {
          id: 'mqtt1',
          name: 'MQTT 1',
          tagsToPlugin: ['tag1']
        },
        {
          id: 'mqtt2',
          name: 'MQTT 2',
          tagFromPlugin: 'tag2'
        },
        {
          id: 'mqtt3',
          name: 'MQTT 3',
          tagFromPlugin: 'tag3'
        },
        {
          id: 'mqtt4',
          name: 'MQTT 4',
          tagFromPlugin: 'tag4'
        },
        {
          id: 'mqtt5',
          name: 'MQTT 5',
          tagFromPlugin: 'tag5'
        }
      ]
    ]
    const {tags, publicTags, tagsToProviderPluginIds, tagsToDestinationPluginIds, duplicateTags, mappingProblems} =
      calculateMappingInfo(toPluginAndMappingsInfo(mappingsForAllPlugins))

    const expectedTags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
    expect(tags).to.deep.equal(expectedTags)
    expect(publicTags).to.deep.equal(expectedTags)

    ;['tag1'].forEach(tag => expect(tagsToProviderPluginIds.get(tag)).to.equal('pluginId0'))
    ;['tag4', 'tag5'].forEach(tag => expect(tagsToProviderPluginIds.get(tag)).to.equal('pluginId1'))
    // Duplicate tags shouldn't have any plugin identified as the source
    ;['tag2', 'tag3'].forEach(tag => expect(tagsToProviderPluginIds.get(tag)).to.equal(undefined))

    checkDestinations(tagsToDestinationPluginIds, {
      tag1: [1],
      tag4: [0],
      tag5: [0]
    })

    expect(Array.from(duplicateTags).sort()).to.deep.equal(['tag2', 'tag3'])

    // Two tags each have two sources, so there should be a total of 4 problem reports
    expect(mappingProblems.length).to.equal(4)

    const pluginInfo = _.range(mappingsForAllPlugins.length).map(infoForPlugin)

    const tag2MappingLocations = [
      {
        ...pluginInfo[0],
        channelId: 'local2',
        channelName: 'Local 2'
      },
      {
        ...pluginInfo[1],
        channelId: 'mqtt2',
        channelName: 'MQTT 2'
      }
    ]
    const tag3MappingLocations = [
      {
        ...pluginInfo[0],
        channelId: 'local3',
        channelName: 'Local 3'
      },
      {
        ...pluginInfo[1],
        channelId: 'mqtt3',
        channelName: 'MQTT 3'
      }
    ]

    const tag2MappingProblems = mappingProblems.slice(0, 2)
    const tag3MappingProblems = mappingProblems.slice(2, 2)

    function checkProblemReports(problems, mappingLocations, tag) {
      problems.forEach((problem, problemIdx) => {
        expect(problem).to.deep.equal({
          mappingLocation: mappingLocations[problemIdx],
          tag,
          problem: MAPPING_PROBLEM_MULTIPLE_SOURCES,
          additionalSources: mappingLocations.slice(0).splice(problemIdx, 1)
        })
      })
    }

    checkProblemReports(tag2MappingProblems, tag2MappingLocations, 'tag2')
    checkProblemReports(tag3MappingProblems, tag3MappingLocations, 'tag3')
  })

  it('identifies missing tags', () => {
    const mappingsForAllPlugins: Array<Array<DataPluginMapping>> = [
      [ // Plugin 1: Local IO
        {
          id: 'local1',
          name: 'Local 1',
          tagFromPlugin: 'tag1'
        },
        {
          id: 'local3',
          name: 'Local 3',
          tagsToPlugin: ['tag3']
        },
        {
          id: 'local4',
          name: 'Local 4',
          tagsToPlugin: ['tag4', 'tag5', 'tag6']
        }
      ],
      [ // Plugin 2: MQTT
        {
          id: 'mqtt1',
          name: 'MQTT 1',
          tagsToPlugin: ['tag1']
        },
        {
          id: 'mqtt2',
          name: 'MQTT 2',
          tagsToPlugin: ['tag1', 'tag2', 'tag5']
        },
        {
          id: 'mqtt5',
          name: 'MQTT 5',
          tagFromPlugin: 'tag5'
        }
      ]
    ]
    const {tags, publicTags, tagsToProviderPluginIds, tagsToDestinationPluginIds, duplicateTags, mappingProblems} =
      calculateMappingInfo(toPluginAndMappingsInfo(mappingsForAllPlugins))

    const expectedTags = ['tag1', 'tag5']
    expect(tags).to.deep.equal(expectedTags)
    expect(publicTags).to.deep.equal(expectedTags)

    ;['tag1'].forEach(tag => expect(tagsToProviderPluginIds.get(tag)).to.equal('pluginId0'))
    ;['tag5'].forEach(tag => expect(tagsToProviderPluginIds.get(tag)).to.equal('pluginId1'))

    checkDestinations(tagsToDestinationPluginIds, {
      tag1: [1],
      tag2: [1],
      tag3: [0],
      tag4: [0],
      tag5: [0, 1],
      tag6: [0]
    })

    expect(duplicateTags.size).to.equal(0)

    const pluginInfo = _.range(mappingsForAllPlugins.length).map(infoForPlugin)

    const expectedProblems = [
      {
        mappingLocation: {...pluginInfo[0], channelId: 'local3', channelName: 'Local 3'},
        tag: 'tag3'
      },
      {
        mappingLocation: {...pluginInfo[0], channelId: 'local4', channelName: 'Local 4'},
        tag: 'tag4'
      },
      {
        mappingLocation: {...pluginInfo[0], channelId: 'local4', channelName: 'Local 4'},
        tag: 'tag6'
      },
      {
        mappingLocation: {...pluginInfo[1], channelId: 'mqtt2', channelName: 'MQTT 2'},
        tag: 'tag2'
      }
    ]

    expect(mappingProblems.length).to.equal(expectedProblems.length)
    mappingProblems.forEach((problem, problemIdx) => {
      const expected = expectedProblems[problemIdx]
      expect(problem).to.deep.equal({
        mappingLocation: expected.mappingLocation,
        tag: expected.tag,
        problem: MAPPING_PROBLEM_NO_SOURCE
      })
    })
  })

  it('filters non public tags', () => {
    const mappingsForAllPlugins: Array<Array<DataPluginMapping>> = [
      [ // Plugin 1: Local IO
        {
          id: 'local1',
          name: 'Local 1',
          tagFromPlugin: 'tag1'
        },
        {
          id: 'local2',
          name: 'Local 2',
          tagFromPlugin: '_internal/tag2'
        }
      ],
      [ // Plugin 2: MQTT
        {
          id: 'mqtt3',
          name: 'MQTT 3',
          tagFromPlugin: 'tag3'
        }
      ]
    ]
    const {tags, publicTags} = calculateMappingInfo(toPluginAndMappingsInfo(mappingsForAllPlugins))

    expect(tags).to.deep.equal(['_internal/tag2', 'tag1', 'tag3'])
    expect(publicTags).to.deep.equal(['tag1', 'tag3'])
  })
})
