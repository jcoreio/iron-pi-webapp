import {expect} from 'chai'

import _ from 'lodash'

import calculateMappingInfo from '../calculateMappingInfo'
import type {DataPluginMapping} from '../DataRouterTypes'
import {
  MAPPING_PROBLEM_MULTIPLE_SOURCES,
  MAPPING_PROBLEM_NO_SOURCE
} from "../../../universal/data-router/TagMappingTypes"

const infoForPlugin = (magic: number) => ({
  pluginType: `pluginType${magic}`,
  pluginInstanceId: `pluginInstanceId${magic}`,
  pluginInstanceName: `Plugin Instance Name ${magic}`
})

const toPluginAndMappingsInfo = (mappingsForAllPlugins: Array<Array<DataPluginMapping>>) =>
  mappingsForAllPlugins.map((mappings: Array<DataPluginMapping>, pluginIdx: number) =>
    ({...infoForPlugin(pluginIdx), mappings}))

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
    const {tagsToPluginInstanceIds, duplicateTags, mappingProblems} =
      calculateMappingInfo(toPluginAndMappingsInfo(mappingsForAllPlugins))

    ;['tag1', 'tag2'].forEach(tag => expect(tagsToPluginInstanceIds.get(tag)).to.equal('pluginInstanceId0'))
    ;['tag3', 'tag4', 'tag5'].forEach(tag => expect(tagsToPluginInstanceIds.get(tag)).to.equal('pluginInstanceId1'))

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
    const {tagsToPluginInstanceIds, duplicateTags, mappingProblems} =
      calculateMappingInfo(toPluginAndMappingsInfo(mappingsForAllPlugins))

    ;['tag1'].forEach(tag => expect(tagsToPluginInstanceIds.get(tag)).to.equal('pluginInstanceId0'))
    ;['tag4', 'tag5'].forEach(tag => expect(tagsToPluginInstanceIds.get(tag)).to.equal('pluginInstanceId1'))
    // Duplicate tags shouldn't have any plugin identified as the source
    ;['tag2', 'tag3'].forEach(tag => expect(tagsToPluginInstanceIds.get(tag)).to.equal(undefined))

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
          tagsToPlugin: ['tag1', 'tag2']
        },
        {
          id: 'mqtt5',
          name: 'MQTT 5',
          tagFromPlugin: 'tag5'
        }
      ]
    ]
    const {tagsToPluginInstanceIds, duplicateTags, mappingProblems} =
      calculateMappingInfo(toPluginAndMappingsInfo(mappingsForAllPlugins))

    ;['tag1'].forEach(tag => expect(tagsToPluginInstanceIds.get(tag)).to.equal('pluginInstanceId0'))
    ;['tag5'].forEach(tag => expect(tagsToPluginInstanceIds.get(tag)).to.equal('pluginInstanceId1'))

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
})
