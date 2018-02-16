// @flow

import * as graphql from 'graphql'

export const LocalIOChannelMode = new graphql.GraphQLEnumType({
  name: 'LocalIOChannelMode',
  values: {
    ANALOG_INPUT: {value: 'ANALOG_INPUT'},
    DIGITAL_INPUT: {value: 'DIGITAL_INPUT'},
    DIGITAL_OUTPUT: {value: 'DIGITAL_OUTPUT'},
    DISABLED: {value: 'DISABLED'},
  }
})
export const LocalIOChannelState = new graphql.GraphQLInterfaceType({
  name: 'LocalIOChannelState',
  fields: {
    mode: {
      type: new graphql.GraphQLNonNull(LocalIOChannelMode),
    },
  },
  resolveType(value: any): ?graphql.GraphQLObjectType {
    switch (value.mode) {
    case 'ANALOG_INPUT': return AnalogInputState
    case 'DIGITAL_INPUT': return DigitalInputState
    case 'DIGITAL_OUTPUT': return DigitalOutputState
    case 'DISABLED': return DisabledLocalIOChannelState
    }
  },
})
export const DigitalChannelState = new graphql.GraphQLInterfaceType({
  name: 'DigitalChannelState',
  fields: {
    reversePolarity: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean),
    },
  },
  resolveType(value: any): ?graphql.GraphQLObjectType {
    switch (value.mode) {
    case 'DIGITAL_INPUT': return DigitalInputState
    case 'DIGITAL_OUTPUT': return DigitalOutputState
    }
  },
})
export const InputChannelState = new graphql.GraphQLInterfaceType({
  name: 'InputChannelState',
  fields: {
    rawInput: {
      type: graphql.GraphQLFloat,
    },
    systemValue: {
      type: graphql.GraphQLFloat,
    },
  },
  resolveType(value: any): ?graphql.GraphQLObjectType {
    switch (value.mode) {
    case 'ANALOG_INPUT': return AnalogInputState
    case 'DIGITAL_INPUT': return DigitalInputState
    }
  },
})
export const AnalogInputState = new graphql.GraphQLObjectType({
  name: 'AnalogInputState',
  interfaces: [LocalIOChannelState, InputChannelState],
  fields: {
    mode: {
      type: new graphql.GraphQLNonNull(LocalIOChannelMode),
    },
    rawInput: {
      type: graphql.GraphQLFloat,
    },
    systemValue: {
      type: graphql.GraphQLFloat,
    },
  },
})
export const DigitalInputState = new graphql.GraphQLObjectType({
  name: 'DigitalInputState',
  interfaces: [LocalIOChannelState, DigitalChannelState, InputChannelState],
  fields: {
    mode: {
      type: new graphql.GraphQLNonNull(LocalIOChannelMode),
    },
    reversePolarity: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean),
    },
    rawInput: {
      type: graphql.GraphQLFloat,
    },
    systemValue: {
      type: graphql.GraphQLFloat,
    },
  },
})
export const DigitalOutputState = new graphql.GraphQLObjectType({
  name: 'DigitalOutputState',
  interfaces: [LocalIOChannelState, DigitalChannelState],
  fields: {
    mode: {
      type: new graphql.GraphQLNonNull(LocalIOChannelMode),
    },
    reversePolarity: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean),
    },
    controlValue: {
      type: graphql.GraphQLInt,
    },
    safeState: {
      type: graphql.GraphQLInt,
    },
    systemValue: {
      type: graphql.GraphQLInt,
    },
    rawOutput: {
      type: graphql.GraphQLInt,
    },
  },
})
export const DisabledLocalIOChannelState = new graphql.GraphQLObjectType({
  name: 'DisabledLocalIOChannelState',
  interfaces: [LocalIOChannelState],
  fields: {
    mode: {
      type: new graphql.GraphQLNonNull(LocalIOChannelMode),
    },
  },
})

